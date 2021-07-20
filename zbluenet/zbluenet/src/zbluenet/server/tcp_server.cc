#include <zbluenet/server/tcp_server.h>
#include <zbluenet/net/socket_address.h>
#include <zbluenet/net/tcp_socket.h>
#include <zbluenet/log.h>
#include <zbluenet/net/select_acceptor.h>
#include <zbluenet/net/network.h>
#include <zbluenet/net/select_reactor.h>

#include <functional>

namespace zbluenet {

	using net::SelectReactor;

	namespace server {

		TcpServer::TcpServer(const std::string &host, uint16_t port, uint8_t reactor_num):
			listen_addr_(host, port),
			reactor_num_(reactor_num)
		{
			// 初始化win32 网络环境
			net::NetWork::Init();
		}

		TcpServer::~TcpServer()
		{
			for (size_t i = 0 ; i < reactors_.size(); ++i) {
				if (reactors_[i] != nullptr) {
					delete reactors_[i];
				}
			}
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
			reactors_.resize(reactor_num_, nullptr);
			for (size_t i = 0; i < reactors_.size(); ++i) {
#ifdef _WIN32
				reactors_[i] = new SelectReactor(int(max_connection_num_ / reactors_.size()) + 1); // 均摊用户数量
#else

#endif
			}

			// 初始化并启动reactors

			// 开启主循环
			while (true) {
				// 处理业务逻辑

				// 处理定时器业务
			}

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