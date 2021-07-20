#include <zbluenet/net/net_thread.h>
#include <zbluenet/net/select_reactor.h>

#include <functional>

namespace zbluenet {
	namespace net {

		NetThread::NetThread(int max_recv_packet_lenth, int max_send_packet_length, const CreateMessageFunc &create_message_func):
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

		bool NetThread::init(int id, int max_client_num, int max_recv_buffer_size, int max_send_buffer_size,
			const NewNetCommandCallback &new_net_cmd_cb)
		{
#ifdef _WIN32
			reactor_ = new SelectReactor(max_client_num);
#else

#endif

			reactor_->setRecvBufferMaxSize(max_recv_buffer_size);
			reactor_->setSendBufferMaxSize(max_send_buffer_size);

			id_ = id;
			new_net_cmd_cb_ = new_net_cmd_cb;
		}

		void NetThread::start()
		{
			thread_.start(nullptr, std::bind(&Reactor::loop, reactor_, std::placeholders::_1));
		}

		void NetThread::push(NetCommand *cmd) // 接收来自主线程发送来的消
		{

		}

		void NetThread::attach(std::unique_ptr<TcpSocket> &peer_socket) // 新连接到来
		{
			reactor_->attachSocket(peer_socket);
		}

		void NetThread::closeSocket(TcpSocket::SocketId socket_id)
		{

		}

	} // 
} // namespace zbluenet