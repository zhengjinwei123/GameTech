#include <zbluenet/net/server.h>
#include <zbluenet/net/tcp_socket.h>

#include <zbluenet/log.h>

namespace zbluenet {
	namespace net {

		Server::Server(const std::string &ip, uint16_t port):
			addr_(ip, port)
		{

		}

		Server::~Server()
		{

		}

		bool Server::createServer(int net_thread_count)
		{
			if (false == listen_socket_.passiveOpenNonblock(addr_)) {
				return false;
			}
			SOCKET fd = listen_socket_.GetFD();

			while (true) {
				fd_set fdRead;
				fd_set fdWrite;
				fd_set fdExcep;
				FD_ZERO(&fdRead);
				FD_ZERO(&fdWrite);
				FD_ZERO(&fdExcep);

				FD_SET(fd, &fdRead);
				FD_SET(fd, &fdWrite);
				FD_SET(fd, &fdExcep);

				for (int n = (int)clients_.size() - 1; n >= 0;n--) {
					FD_SET(clients_[n], &fdRead);
				}

				timeval delta = { 1, 0 };

				int ret = select(fd + 1, &fdRead, &fdWrite, &fdExcep, &delta);
				if (ret < 0) {
					LOG_DEBUG("zjw 3333");
					break;
				}

				FD_SET(fd, &fdRead);
				if (FD_ISSET(fd, &fdRead)) {
					FD_CLR(fd, &fdRead);

					std::unique_ptr<TcpSocket> client_socket(new TcpSocket());
					if (false == listen_socket_.acceptNonblock(client_socket.get())) {
						continue;
					}
					if (client_socket->GetFD() == INVALID_SOCKET) {
						continue;
					}

					clients_.emplace_back(client_socket->GetFD());

					LOG_DEBUG("客户端加入了");
				}
				LOG_DEBUG("zjw555");
			}

			return true;
		}
	} // namespace net
} // namespace zbluenet