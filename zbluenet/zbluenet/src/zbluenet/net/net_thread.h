#ifndef ZBLUENET_NET_NET_THREAD_H
#define ZBLUENET_NET_NET_THREAD_H

#include <functional>
#include <memory>

#include <zbluenet/concurrent_queue.h>
#include <zbluenet/net/tcp_socket.h>
#include <zbluenet/thread.h>
#include <zbluenet/net/reactor.h>
#include <zbluenet/protocol/net_protocol.h>
#include <zbluenet/protocol/net_command.h>

namespace zbluenet {

	class DynamicBuffer;

	namespace exchange {
		class BaseStruct;
	}

	using protocol::NetProtocol;

	namespace net {

		class NetId;
		class TcpSocket;

		class NetThread {
		public:
			using CreateMessageFunc = std::function<void (zbluenet::exchange::BaseStruct * (int))>; // 创建消息实体的接口
			using NewNetCommandCallback = std::function<void(std::unique_ptr<NetCommand> &)>; // 接收消息的回调函数, 主线程传递进来的
			using NetCommandQueue = ConcurrentQueue<NetCommand *>; // 发送消息的队列

			NetThread( int max_recv_packet_lenth, int max_send_packet_length, const CreateMessageFunc &create_message_func);
			~NetThread();

			bool init(int id, int max_client_num, int max_recv_buffer_size, int max_send_buffer_size, const NewNetCommandCallback &new_net_cmd_cb);

			void start();
			void push(NetCommand *cmd); // 接收来自主线程发送来的消息
			void attach(std::unique_ptr<TcpSocket> &peer_socket); // 新连接到来

		private:
			void closeSocket(TcpSocket::SocketId socket_id);


		private:
			int id_;
			Thread thread_;
			Reactor *reactor_;
			NetCommandQueue command_queue_; // 发送消息的队列
			NetProtocol net_protocol_; // 消息解析
			DynamicBuffer encode_buffer_; // 消息编码
			NewNetCommandCallback new_net_cmd_cb_; // 接收消息的，主进程传递进来， 消息接收后放到主进程的消息队列里
		};

	} // namespace net
} // namespace zbluenet

#endif // ZBLUENET_NET_NET_THREAD_H
