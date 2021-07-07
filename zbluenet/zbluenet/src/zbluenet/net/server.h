#ifndef ZBLUENET_NET_SERVER_H
#define ZBLUENET_NET_SERVER_H

#include <vector>

#include <zbluenet/net/tcp_socket.h>
#include <zbluenet/net/socket_address.h>

namespace zbluenet {
	namespace net {

		class Server {
		public:
			using ClientVec = std::vector<SOCKET>;
			Server(const std::string &ip, uint16_t port);
			virtual ~Server();
		    bool createServer(int net_thread_count = 2);

		private:
			SocketAddress addr_;
			TcpSocket listen_socket_;
			ClientVec clients_;
		};
	} // namespace net
} // namespace zbluenet

#endif // ZBLUENET_NET_SERVER_H
