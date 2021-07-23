#ifndef ZBLUENET_SERVER_TCP_SERVICE_H
#define ZBLUENET_SERVER_TCP_SERVICE_H

#include <string>
#include <stdint.h>
#include <functional>
#include <vector>

#include <zbluenet/net/socket_address.h>
#include <zbluenet/net/tcp_socket.h>
#include <zbluenet/net/acceptor.h>
#include <zbluenet/net/reactor.h>
#include <zbluenet/net/tcp_connection.h>


namespace zbluenet {

	class DynamicBuffer;

	namespace exchange {
		class BaseStruct;
	}

	namespace net {
		class NetThread;
		class IOService;
	}

	namespace protocol {
		class NetCommand;
	}

	using net::SocketAddress;
	using net::TcpSocket;
	using net::Acceptor;
	using net::Reactor;
	using net::TcpConnection;
	using net::NetThread;
	using protocol::NetCommand;
	using net::IOService;

	namespace server {

		class TcpService : public IOService {
		public:
			using NetThreadVector = std::vector<NetThread *>;
			using CreateMessageFunc = std::function<zbluenet::exchange::BaseStruct *(int)>;
			using RecvMessageCallback = std::function< void(NetThread *, TcpSocket::SocketId, DynamicBuffer *)>;
		

		public:
			TcpService(const std::string &host, uint16_t port, uint8_t reactor_num);
			virtual ~TcpService();

			bool createService(const RecvMessageCallback &recv_message_cb, uint16_t max_clien_num);
			bool start();

		private:
			void loop();
			void onNewConnCallback(std::unique_ptr<TcpSocket> &peer_socket);

			void onNewNetCommandCallback(std::unique_ptr<NetCommand> &cmd);
			void setCreateMessageFunc(const CreateMessageFunc &create_message_func) 
			{
				create_message_func_ = create_message_func;
			}

		private:
			SocketAddress listen_addr_;
			TcpSocket listen_socket_;
			uint8_t net_thread_num_; // 反应器线程数量
			Acceptor *net_acceptor_;
			int max_connection_num_;
			NetThreadVector net_threads_;

			RecvMessageCallback recv_message_cb_;
			CreateMessageFunc create_message_func_;
		};
	} // namespace server
} // namespace zbluenet
#endif // ZBLUENET_SERVER_TCP_SERVICE_H
