#include <zbluenet/server/tcp_service.h>
#include <zbluenet/net/socket_address.h>
#include <zbluenet/net/tcp_socket.h>
#include <zbluenet/log.h>
#include <zbluenet/net/select_acceptor.h>
#include <zbluenet/net/network.h>
#include <zbluenet/net/net_thread.h>
#include <zbluenet/protocol/net_command.h>
#include <zbluenet/timestamp.h>
#include <zbluenet/exchange/base_struct.h>

#include <functional>
#include <memory>

namespace zbluenet {

	namespace server {

		TcpService::TcpService(const std::string &host, uint16_t port, uint8_t net_thread_num):
			listen_addr_(host, port),
			net_thread_num_(net_thread_num),
			net_acceptor_(nullptr),
			recv_message_cb_(nullptr),
			max_request_per_second_(0)
		{
			// 初始化win32 网络环境
			net::NetWork::Init();
		}

		TcpService::~TcpService()
		{
			for (size_t i = 0 ; i < net_threads_.size(); ++i) {
				if (net_threads_[i] != nullptr) {
					delete net_threads_[i];
				}
			}
		}

		bool TcpService::createService(const RecvMessageCallback &recv_message_cb, uint16_t  max_clien_num)
		{
			if (false == listen_socket_.passiveOpenNonblock(listen_addr_)) {
				LOG_MESSAGE_ERROR("TcpServer::createServer passiveOpenNonblock failed");
				return false;
			}

#ifdef _WIN32
			net_acceptor_ = new net::SelectAcceptor(&listen_socket_, max_clien_num);
#else

#endif
			net_acceptor_->setNewConnCallback(std::bind(&TcpService::onNewConnCallback, this, std::placeholders::_1));

			max_connection_num_ = max_clien_num;

			recv_message_cb_ = recv_message_cb;
			return true;
		}

		bool TcpService::init(const NewNetCommandCallback &new_net_cmd_cb, 
			const CreateMessageFunc &create_messgae_func, int max_request_per_second)
		{
			if (net_acceptor_ == nullptr) {
				return false;
			}

			// 创建监听线程
			if (false == net_acceptor_->start()) {
				return false;
			}

			// 创建网络线程组
			net_threads_.resize(net_thread_num_, nullptr);
			for (size_t i = 0; i < net_threads_.size(); ++i) {
				net_threads_[i] = new NetThread(40960, 40960, create_messgae_func);
			}
			// 初始化
			for (size_t i = 0; i < net_threads_.size(); ++i) {
				if (false == net_threads_[i]->init(
					i,
					(max_connection_num_ % net_threads_.size()) + 1,
					81920,
					409600,
					new_net_cmd_cb,
					recv_message_cb_))
				{
					return false;
				}
			}

			max_request_per_second_ = max_request_per_second;

			return true;
		}

		void TcpService::stop()
		{
			// 结束发送线程消息的循环
			for (size_t  i = 0; i < net_threads_.size(); ++i) {
				net_threads_[i]->push(nullptr);
			}

			for (size_t i = 0; i< net_threads_.size(); ++i) {
				net_threads_[i]->stop();
			}
		}

		void TcpService::start()
		{
			// 启动网络线程
			for (size_t i = 0; i < net_threads_.size(); ++i) {
				net_threads_[i]->start();
			}

			loop();
		}

		// 开启主循环
		void TcpService::loop()
		{
			zbluenet::Timestamp now;
			while (!quit_) {
				now.setNow();
				// 处理业务逻辑

				// 处理定时器业务
				checkTimeout(now);
			}
		}

		void TcpService::push(std::unique_ptr<NetCommand> &cmd)
		{
			net_threads_[cmd->id.reactor_id]->push(cmd.get());
			cmd.release();
		}

		// 新连接到来
		void TcpService::onNewConnCallback(std::unique_ptr<TcpSocket> &peer_socket)
		{
			SocketAddress remote_addr;
			peer_socket->getPeerAddress(&remote_addr);
			LOG_MESSAGE_DEBUG("新连接到了 %lld, addr: [%s:%d]", peer_socket->getId(), remote_addr.getIp().c_str(), remote_addr.getPort());
		
			// 负载均衡, 分配给一个reactor
			size_t min_connection_thread_index = 0;
			size_t min_connection_num = net_threads_[0]->getConnectionNum();
			for (size_t i = 0; i < net_threads_.size(); ++i) {
				if (i == 0) {
					continue;
				}
				if (net_threads_[i]->getConnectionNum() < min_connection_num) {
					min_connection_num = net_threads_[i]->getConnectionNum();
					min_connection_thread_index = i;
				}
			}

			net_threads_[min_connection_thread_index]->attach(peer_socket);
		}

		void TcpService::disconnect(const NetId &net_id)
		{
			std::unique_ptr<NetCommand> cmd(new NetCommand(NetCommand::Type::CLOSE));
			cmd->id = net_id;
			push(cmd);

			onDisconnect(net_id);
		}

		void TcpService::sendMessage(const NetId &net_id, int message_id,
			std::unique_ptr<zbluenet::exchange::BaseStruct> &message)
		{
			std::unique_ptr<NetCommand> cmd(new NetCommand(NetCommand::Type::MESSAGE));
			cmd->id = net_id;
			cmd->message_id = message_id;
			cmd->message = message.release();
			push(cmd);
		}

		void TcpService::enableBroadcast(const NetId &net_id)
		{
			std::unique_ptr<NetCommand> cmd(new NetCommand(NetCommand::Type::ENABLE_BROADCAST));
			cmd->id = net_id;
			push(cmd);
		}

		void TcpService::disableBroadcast(const NetId &net_id)
		{
			std::unique_ptr<NetCommand> cmd(new NetCommand(NetCommand::Type::DISABLE_BROADCAST));
			cmd->id = net_id;
			push(cmd);
		}

		void TcpService::broadcastMessage(int message_id,
			std::unique_ptr<zbluenet::exchange::BaseStruct> &message)
		{
			for (size_t i = 0; i < net_threads_.size(); ++i) {
				std::unique_ptr<NetCommand> cmd(new NetCommand(NetCommand::Type::BROADCAST));
				cmd->id.reactor_id = static_cast<int>(i);
				cmd->message_id = message_id;
				cmd->message = message->clone();
				push(cmd);
			}
			message.reset();
		}

		void TcpService::onConnect(const NetId &net_id)
		{
			ConnectionInfo info;
			info.last_request_second = 0;
			info.requst_per_second = 0;
			connection_infos_.insert(std::make_pair(net_id, info));
		}

		void TcpService::onDisconnect(const NetId &net_id)
		{
			NetId net_id_copy = net_id;
			connection_infos_.erase(net_id_copy);
		}

		void TcpService::onMessage(const NetId &net_id,
			int message_id, const zbluenet::exchange::BaseStruct *message)
		{
			ConnectionInfoMap::iterator iter = connection_infos_.find(net_id);
			if (iter == connection_infos_.end()) {
				return;
			}

			ConnectionInfo &info = iter->second;
			if (max_request_per_second_ > 0 && checkRequestFrequencyLimit(info)) {
				LOG_MESSAGE_ERROR("net_id(%d:%lx) exceed request frequency limit (%d >= %d)",
					net_id.reactor_id, net_id.socket_id, info.requst_per_second, max_request_per_second_);

				this->onExceedRequestFrequencyLimit(net_id);
				disconnect(net_id);
				return;
			}

			MessageHandler func = getMessageHandler(message_id);
			if (func) {
				func(net_id, message);
			} else {
				LOG_MESSAGE_ERROR("message_id(%d) handler not set", message_id);
			}
		}

		bool TcpService::checkRequestFrequencyLimit(ConnectionInfo &info)
		{
			time_t now = Timestamp::getNow();
			if (now == info.last_request_second) {
				++info.requst_per_second;
			} else {
				info.last_request_second = now;
				info.requst_per_second = 0;
			}

			return info.requst_per_second > max_request_per_second_;
		}


	} // namespace server
} // namespace zbluenet