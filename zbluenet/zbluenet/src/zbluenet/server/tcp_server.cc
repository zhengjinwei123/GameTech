#include <zbluenet/server/tcp_server.h>
#include <zbluenet/net/socket_address.h>
#include <zbluenet/net/tcp_socket.h>
#include <zbluenet/log.h>
#include <zbluenet/net/select_acceptor.h>
#include <zbluenet/net/network.h>

#include <functional>

namespace zbluenet {

	namespace server {

		TcpServer::TcpServer(const std::string &host, uint16_t port, uint8_t reactor_num):
			listen_addr_(host, port),
			reactor_num_(reactor_num)
		{
			net::NetWork::Init();
		}

		TcpServer::~TcpServer()
		{

		}

		bool TcpServer::createServer(uint16_t  max_clien_num)
		{
			if (false == listen_socket_.passiveOpenNonblock(listen_addr_)) {
				LOG_ERROR("TcpServer::createServer passiveOpenNonblock failed");
				return false;
			}

#ifdef _WIN32
			net_acceptor_ = new net::SelectAcceptor(&listen_socket_, max_clien_num);
#else

#endif
			net_acceptor_->setNewConnCallback(std::bind(&TcpServer::onNewConnCallback, this, std::placeholders::_1));

			max_connection_num_ = max_clien_num;
			return true;
		}

		bool TcpServer::start()
		{
			if (net_acceptor_ == nullptr) {
				return false;
			}

			// 创建监听线程
			if (false == net_acceptor_->start()) {
				return false;
			}

			// 创建网络线程组


			return true;
		}

		void TcpServer::onNewConnCallback(std::unique_ptr<TcpSocket> &peer_socket)
		{
			// 新连接到来
			LOG_DEBUG("新连接到了 %lld", peer_socket->getId());

			// 负载均衡, 分配给一个reactor

		}
	} // namespace server
} // namespace zbluenet