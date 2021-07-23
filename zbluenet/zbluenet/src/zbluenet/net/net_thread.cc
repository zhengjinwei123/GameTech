#include <zbluenet/net/net_thread.h>
#include <zbluenet/net/select_reactor.h>
#include <zbluenet/log.h>

#include <functional>
#include <memory>

namespace zbluenet {
	namespace net {

		NetThread::NetThread(int max_recv_packet_lenth, int max_send_packet_length, const CreateMessageFunc &create_message_func) :
			id_(-1),
			reactor_(nullptr),
			net_protocol_(max_recv_packet_lenth, create_message_func),
			encode_buffer_(max_send_packet_length),
			new_net_cmd_cb_(nullptr)
		{

		}

		NetThread::~NetThread()
		{
			if (reactor_ != nullptr) {
				delete reactor_;
			}
			thread_.close();
		}

		bool NetThread::init(int id,
			int max_client_num,
			int max_recv_buffer_size,
			int max_send_buffer_size,
			const NewNetCommandCallback &new_net_cmd_cb,
			const RecvMessageCallback &recv_message_cb)
		{
#ifdef _WIN32
			reactor_ = new SelectReactor(max_client_num);
#else

#endif

			reactor_->setRecvBufferMaxSize(max_recv_buffer_size);
			reactor_->setSendBufferMaxSize(max_send_buffer_size);

			// ��Ϣ�ص�
			reactor_->setRecvMessageCallback(std::bind(&NetThread::onRecvMessage, this, std::placeholders::_1,
				std::placeholders::_2, std::placeholders::_3));
			// �رջص�
			reactor_->setPeerCloseCallback(std::bind(&NetThread::onPeerClose, this, std::placeholders::_1, std::placeholders::_2));
			// �����ص�
			reactor_->setErrorCallback(std::bind(&NetThread::onError, this, std::placeholders::_1,
				std::placeholders::_2, std::placeholders::_3));

			reactor_->setWriteMessageCallback([=]()-> void {
				this->onNetCommand();
			});


			// �߳�id
			id_ = id;
			//  ������Ϣ�Ļص�����, ���̴߳��ݽ�����
			new_net_cmd_cb_ = new_net_cmd_cb;

			recv_message_cb_ = recv_message_cb;

			return true;
		}

		void NetThread::start()
		{
			NetThread *that = this;
			thread_.start(nullptr, [that](Thread *pthread) -> void {
				if (that->reactor_ != nullptr) {
					that->reactor_->loop();
				}
			});
		}

		void NetThread::push(NetCommand *cmd) // �����������̷߳���������Ϣ
		{
			command_queue_.push(cmd);
		}

		void NetThread::attach(std::unique_ptr<TcpSocket> &peer_socket) // �����ӵ���
		{
			reactor_->attachSocket(peer_socket);
		}

		void NetThread::closeSocket(TcpSocket::SocketId socket_id)
		{
			sendNetCommandClose(socket_id);
			reactor_->closeSocket(socket_id);
		}

		void NetThread::sendNetCommandClose(TcpSocket::SocketId socket_id)
		{
			std::unique_ptr<NetCommand> cmd(new NetCommand(NetCommand::Type::CLOSE));
			cmd->id.reactor_id = id_;
			cmd->id.socket_id = socket_id;
			new_net_cmd_cb_(cmd);
		}

		// ��Ϣ����
		void NetThread::onRecvMessage(Reactor *reactor, TcpSocket::SocketId socket_id, DynamicBuffer *buffer)
		{
			if (recv_message_cb_) {
				recv_message_cb_(this, socket_id, buffer);
			}
		}

		// �Է��ر�
		void NetThread::onPeerClose(Reactor *reactor, TcpSocket::SocketId socket_id)
		{
			LOG_MESSAGE_DEBUG("net_thread close peer, net_id(%d: %lx)", id_, socket_id);
			closeSocket(socket_id);
		}

		// ������
		void NetThread::onError(Reactor *reactor, TcpSocket::SocketId socket_id, int error)
		{
			LOG_MESSAGE_ERROR("net_thread error  net_id (%d:%lx), error_code=(%d), error=(%s)", id_, socket_id, error, strerror(error));

			closeSocket(socket_id);
		}

		void NetThread::quit()
		{
			reactor_->quit();
		}
		// ��Ҫ���͵���Ϣ�� ���̵߳�ѭ���д���
		void NetThread::onNetCommand()
		{
			NetCommand *cmd_raw = nullptr;

			while (command_queue_.popIfNotEmpty(cmd_raw)) {
				if (nullptr == cmd_raw) {
					quit();
					return;
				}

				std::unique_ptr<NetCommand> cmd(cmd_raw);
				// broadcast
				if (NetCommand::Type::BROADCAST == cmd->type) {
					if (net_protocol_.writeMessage(cmd->message_id, cmd->message, &encode_buffer_) == false) {
						LOG_MESSAGE_ERROR("NetThread::onNetCommand encode broadcast message failed on net_thread(%d)", id_);
						continue;
					}

					for (auto iter = broadcast_list_.begin(); iter != broadcast_list_.end(); ++iter) {
						reactor_->sendMessage(*iter, encode_buffer_.readBegin(), encode_buffer_.readableBytes());
					}

					continue;
				}

				if (reactor_->isConnected(cmd->id.socket_id) == false) {
					continue;
				}

				if (NetCommand::Type::CLOSE == cmd->type) {
					reactor_->closeSocket(cmd->id.socket_id);
					continue;
				}  else if (NetCommand::Type::MESSAGE == cmd->type) {
					if (net_protocol_.writeMessage(cmd->message_id, cmd->message, &encode_buffer_) == false) {
						LOG_MESSAGE_ERROR("encode message(%d) failed on net_id(%d:%lx)", cmd->message_id, id_, cmd->id.socket_id);
						closeSocket(cmd->id.socket_id);
						continue;
					}

					reactor_->sendMessage(cmd->id.socket_id, encode_buffer_.readBegin(), encode_buffer_.readableBytes());
				} else if (NetCommand::Type::ENABLE_BROADCAST == cmd->type) {
					broadcast_list_.insert(cmd->id.socket_id);
				} else if (NetCommand::Type::DISABLE_BROADCAST== cmd->type) {
					broadcast_list_.erase(cmd->id.socket_id);
				}
			}
		}

	} // 
} // namespace zbluenet