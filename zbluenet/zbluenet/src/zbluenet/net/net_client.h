#ifndef ZBLUENET_NET_NET_CLIENT_H
#define ZBLUENET_NET_NET_CLIENT_H

#include <zbluenet/net/tcp_socket.h>
#include <zbluenet/net/platform.h>

namespace zbluenet {
	namespace net {

		class NetClient {
		public:


		private:
			int client_id_;
			SOCKET client_fd_;
		};
	} // namespace net
} // namespace zbluenet
#endif // ZBLUENET_NET_NET_CLIENT_H
