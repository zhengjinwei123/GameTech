#ifndef ZBLUENET_SERVER_TCP_SERVER_H
#define ZBLUENET_SERVER_TCP_SERVER_H

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

	namespace exchange {
		class BaseStruct;
	}

	using net::SocketAddress;
	using net::TcpSocket;
	using net::Acceptor;
	using net::Reactor;
	using net::TcpConnection;

	namespace server {

		class TcpServer {
		public:
			using ReactorVector = std::vector<Reactor *>;
			using CreateMessageFunc = std::function<zbluenet::exchange::BaseStruct *(int)>;
		

		public:
			TcpServer(const std::string &host, uint16_t port, uint8_t reactor_num);
			virtual ~TcpServer();

			bool createServer(uint16_t max_clien_num = 1024);
			bool start();

		private:
			void onNewConnCallback(std::unique_ptr<TcpSocket> &peer_socket);

		private:
			SocketAddress listen_addr_;
			TcpSocket listen_socket_;
			uint8_t reactor_num_; // 反应器线程数量
			Acceptor *net_acceptor_;
			int max_connection_num_;
			ReactorVector reactors_;
		};
	} // namespace server
} // namespace zbluenet
#endif // ZBLUENET_SERVER_TCP_SERVER_H
