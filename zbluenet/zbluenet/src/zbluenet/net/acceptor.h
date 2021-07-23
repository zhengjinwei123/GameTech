#ifndef ZBLUENET_NET_ACCEPTOR_H
#define ZBLUENET_NET_ACCEPTOR_H

#include <zbluenet/class_util.h>
#include <zbluenet/thread.h>
#include <zbluenet/net/tcp_socket.h>

#include <zbluenet/net/socket_id_allocator.h>
#include <zbluenet/net/io_service.h>
#include <zbluenet/log.h>

#include <functional>
#include <memory>
#include <cstddef>
#include <stdint.h>
#include <vector>

namespace zbluenet {

	namespace net {

		class Acceptor  : public IOService {
		public:
			using NewConnectionCallback = std::function<void (std::unique_ptr<TcpSocket> &peer_socket)>;

		public:
			Acceptor(TcpSocket *listen_socket, uint16_t max_socket_num = 1024) : listen_socket_(listen_socket), quit_(true),
				new_conn_cb_(nullptr),
				max_socket_num_(max_socket_num)
			{
				
			}

			virtual ~Acceptor() {
				quit_ = true;
				if (thread_.isRun()) {
					thread_.close();
				}
			}

			void setNewConnCallback(NewConnectionCallback new_conn_cb)
			{
				new_conn_cb_ = new_conn_cb;
			}

			virtual bool start()
			{
				quit_ = false;

				Acceptor *that = this;
				thread_.start(nullptr, [that](Thread *pthread) -> void {
					that->loop();
				});
				
				return true;
			}

			virtual void stop()
			{
				quit_ = true;
				thread_.close();
			}

			virtual void loop() {}

		protected:
			bool accept()
			{
				std::unique_ptr<TcpSocket> peer_socket(new TcpSocket());
				if (false == listen_socket_->acceptNonblock(peer_socket.get())) {
					LOG_MESSAGE_ERROR("TcpServer::createServer passiveOpenNonblock failed");
					return false;
				}

				// ����socketid
				TcpSocket::SocketId socket_id = socket_id_allocator_.nextId(peer_socket->GetFD());
				peer_socket->setId(socket_id);

				if (new_conn_cb_)
					new_conn_cb_(peer_socket);

				return true;
			}
			
		protected:
			SocketAddress socket_addr_;
			TcpSocket *listen_socket_;
			Thread thread_;
			bool quit_;
			SocketIdAllocator socket_id_allocator_;

			NewConnectionCallback new_conn_cb_;

			uint16_t max_socket_num_;
		};
	} // namespace net
} // namespace zbluenet


#endif // ZBLUENET_NET_ACCEPTOR_H
