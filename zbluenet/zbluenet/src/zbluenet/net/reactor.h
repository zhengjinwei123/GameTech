#ifndef ZBLUENET_NET_REACTOR_H
#define ZBLUENET_NET_REACTOR_H

#include <zbluenet/class_util.h>
#include <zbluenet/net/tcp_connection.h>
#include <zbluenet/net/tcp_socket.h>
#include <zbluenet/net/io_device.h>
#include <zbluenet/thread.h>

#include <stdint.h>
#include <memory>
#include <functional>
#include <unordered_map>

namespace zbluenet {
	namespace net {

		class Reactor : public Noncopyable {
		public:
			using TcpSocketMap = std::unordered_map<TcpSocket::SocketId, TcpSocket *>;
			using TcpConnectionMap = std::unordered_map<TcpSocket::SocketId, TcpConnection *>;

		public:
			Reactor(int max_connection_num) : quit_(false), 
				id_(0), 
				max_connection_num_(max_connection_num),
				conn_read_buffer_init_size_(0),
				conn_read_buffer_expand_size_(0),
				conn_read_buffer_max_size_(0),
				conn_write_buffer_init_size_(0),
				conn_write_buffer_expand_size_(0),
				conn_write_buffer_max_size_(0)
			{
	
			}

			virtual ~Reactor() {
				quit();
			}

			void init(uint16_t id, size_t conn_read_buffer_init_size,
				size_t conn_read_buffer_expand_size, size_t conn_read_buffer_max_size,
				size_t conn_write_buffer_init_size, size_t conn_write_buffer_expand_size,
				size_t conn_write_buffer_max_size)
			{
				id_ = id;

				conn_read_buffer_init_size_ = conn_read_buffer_init_size;
				conn_read_buffer_expand_size_ = conn_read_buffer_expand_size;
				conn_read_buffer_max_size_ = conn_read_buffer_max_size;

				conn_write_buffer_init_size_ = conn_write_buffer_init_size;
				conn_write_buffer_expand_size_ = conn_write_buffer_expand_size;
				conn_write_buffer_max_size_ = conn_write_buffer_max_size;
			}

			bool attachSocket(std::unique_ptr<TcpSocket> &peer_socket)
			{
				if (sockets_.find(peer_socket->getId()) != sockets_.end()) {
					return false;
				}

				peer_socket->setReadCallback(std::bind(&Reactor::onSocketRead, this, std::placeholders::_1));
				peer_socket->setErrorCallback(std::bind(&Reactor::onSocketError, this, std::placeholders::_1));
				
				// create connection
				std::unique_ptr<TcpConnection> connection(new TcpConnection(peer_socket.get(),
					conn_read_buffer_init_size_, conn_read_buffer_expand_size_,
					conn_write_buffer_init_size_, conn_write_buffer_expand_size_));
				connection->setStatus(TcpConnection::Status::CONNECTED);

				auto socket_id = peer_socket->getId();
				sockets_.insert(std::make_pair(peer_socket->getId(), peer_socket.get()));
				peer_socket.release();

				connections_.insert(std::make_pair(socket_id, connection.get()));
				connection.release();

				return true;
			}

			void start()
			{
				quit_ = false;
				thread_.start(nullptr, std::bind(&Reactor::loop, this, std::placeholders::_1));
			}

			const size_t getConnectionNum() const { return connections_.size();  }

			virtual void loop(Thread *pthread) = 0;
			virtual void quit() 
			{ 
				quit_ = true; 
				thread_.close();
			}

		protected:
			void onSocketRead(IODevice *io_device)
			{

			}

			void onSocketError(IODevice *io_device)
			{

			}
			

		protected:
			bool quit_;
			uint16_t id_;
			int max_connection_num_;

			size_t conn_read_buffer_init_size_;
			size_t conn_read_buffer_expand_size_;
			size_t conn_read_buffer_max_size_;

			size_t conn_write_buffer_init_size_;
			size_t conn_write_buffer_expand_size_;
			size_t conn_write_buffer_max_size_;

			TcpSocketMap sockets_;
			TcpConnectionMap connections_;

			Thread thread_;
		};
	} // namespace net 
} // namespace zbluenet
#endif // ZBLUENET_NET_REACTOR_H
