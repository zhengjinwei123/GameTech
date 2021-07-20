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
			using CreateMessageFunc = std::function<void (zbluenet::exchange::BaseStruct * (int))>; // ������Ϣʵ��Ľӿ�
			using NewNetCommandCallback = std::function<void(std::unique_ptr<NetCommand> &)>; // ������Ϣ�Ļص�����, ���̴߳��ݽ�����
			using NetCommandQueue = ConcurrentQueue<NetCommand *>; // ������Ϣ�Ķ���

			NetThread( int max_recv_packet_lenth, int max_send_packet_length, const CreateMessageFunc &create_message_func);
			~NetThread();

			bool init(int id, int max_client_num, int max_recv_buffer_size, int max_send_buffer_size, const NewNetCommandCallback &new_net_cmd_cb);

			void start();
			void push(NetCommand *cmd); // �����������̷߳���������Ϣ
			void attach(std::unique_ptr<TcpSocket> &peer_socket); // �����ӵ���

		private:
			void closeSocket(TcpSocket::SocketId socket_id);


		private:
			int id_;
			Thread thread_;
			Reactor *reactor_;
			NetCommandQueue command_queue_; // ������Ϣ�Ķ���
			NetProtocol net_protocol_; // ��Ϣ����
			DynamicBuffer encode_buffer_; // ��Ϣ����
			NewNetCommandCallback new_net_cmd_cb_; // ������Ϣ�ģ������̴��ݽ����� ��Ϣ���պ�ŵ������̵���Ϣ������
		};

	} // namespace net
} // namespace zbluenet

#endif // ZBLUENET_NET_NET_THREAD_H
