#include <zbluenet/server/tcp_service.h>
#include <zbluenet/net/socket_address.h>
#include <zbluenet/net/tcp_socket.h>
#include <zbluenet/log.h>
#include <zbluenet/net/select_acceptor.h>
#include <zbluenet/net/network.h>
#include <zbluenet/net/net_thread.h>
#include <zbluenet/protocol/net_command.h>
#include <zbluenet/timestamp.h>

#include <functional>
#include <memory>

namespace zbluenet {

	namespace server {

		TcpService::TcpService(const std::string &host, uint16_t port, uint8_t net_thread_num):
			listen_addr_(host, port),
			net_thread_num_(net_thread_num)
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

		bool TcpService::start()
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
				net_threads_[i] = new NetThread(40960, 40960, create_message_func_);
			}
			// 初始化
			for (size_t i = 0; i < net_threads_.size(); ++i) {
				if (false == net_threads_[i]->init(
					i, 
					(max_connection_num_ % net_threads_.size()) + 1,
					81920, 
					409600,
					std::bind(&TcpService::onNewNetCommandCallback, this, std::placeholders::_1),
					recv_message_cb_)) 
				{
					return false;
				}
			}

			// 启动网络线程
			for (size_t i = 0; i < net_threads_.size(); ++i) {
				net_threads_[i]->start();
			}

			loop();

			return true;
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

		// 	using NewNetCommandCallback = std::function<void(std::unique_ptr<NetCommand> &)>; // 接收消息的回调函数, 主线程传递进来的
		void TcpService::onNewNetCommandCallback(std::unique_ptr<zbluenet::protocol::NetCommand> &cmd)
		{

		}

	} // namespace server
} // namespace zbluenet