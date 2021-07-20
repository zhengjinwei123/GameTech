#include <zbluenet/net/reactor.h>

#include <algorithm>

namespace zbluenet {
	namespace net {

		Reactor::Reactor(int max_connection_num) : quit_(false),
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

		Reactor::~Reactor() {
			for (TcpConnectionMap::iterator iter = connections_.begin();
				iter != connections_.end(); ++iter) {
				delete iter->second;
			}

			for (TcpSocketMap::iterator iter = sockets_.begin();
				iter != sockets_.end(); ++iter) {
				delete iter->second;
			}


			quit();
		}

		void Reactor::setRecvBufferInitSize(size_t size)
		{
			conn_read_buffer_init_size_ = size;
		}

		void Reactor::setRecvBufferExpandSize(size_t size)
		{
			conn_read_buffer_expand_size_ = size;
		}

		void Reactor::setRecvBufferMaxSize(size_t size)
		{
			conn_read_buffer_max_size_ = size;
		}

		////
		void Reactor::setSendBufferInitSize(size_t size)
		{
			conn_write_buffer_init_size_ = size;
		}

		void Reactor::setSendBufferExpandSize(size_t size)
		{
			conn_write_buffer_expand_size_ = size;
		}

		void Reactor::setSendBufferMaxSize(size_t size)
		{
			conn_write_buffer_max_size_ = size;
		}

		void Reactor::init(uint16_t id)
		{
			id_ = id;
		}

		// 解绑
		void Reactor::closeSocket(SocketId socket_id)
		{

			{
				TcpConnectionMap::iterator iter = connections_.find(socket_id);
				if (iter != connections_.end()) {
					delete iter->second;
					connections_.erase(iter);
				}
			}

			{
				TcpSocketMap::iterator iter = sockets_.find(socket_id);
				if (iter != sockets_.end()) {
					delete iter->second;
					sockets_.erase(iter);
				}
			}

		}

		// 绑定socket
		bool Reactor::attachSocket(std::unique_ptr<TcpSocket> &peer_socket)
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

		void Reactor::start()
		{
			quit_ = false;
			thread_.start(nullptr, std::bind(&Reactor::loop, this, std::placeholders::_1));
		}



		 void Reactor::quit()
		{
			quit_ = true;
			thread_.close();
		}


		 // 消息来了
		 void Reactor::onSocketRead(IODevice *io_device)
		 {
			 TcpSocket *socket = static_cast<TcpSocket *>(io_device);
			 SocketId socket_id = socket->getId();

			 TcpConnectionMap::iterator iter = connections_.find(socket_id);
			 if (connections_.end() == iter) {
				 return;
			 }

			 TcpConnection *connection = iter->second;
			 DynamicBuffer &read_buffer = connection->getReadBuffer();

			 bool data_arrive = false;
			 bool peer_close = false;

			 for (;;) {
				 int bytes_to_read = std::max(1, socket->readableBytes());

				 // 检查缓冲是否溢出
				 if (conn_read_buffer_max_size_ > 0 &&
					 bytes_to_read + read_buffer.readableBytes() > conn_read_buffer_max_size_) {
					 peer_close = true;
					 break;
				 }

				 read_buffer.reserveWritableBytes(bytes_to_read);

				 int ret = socket->recv(read_buffer.writeBegin(), bytes_to_read);
				 if (ret > 0) {
					 read_buffer.write(ret);
					 data_arrive = true;
				 } else if (ret < 0) {
					 if (EAGAIN == errno) {
						break;
					 }

					 connection->setError(errno);
					 if (error_cb_) {
						 error_cb_(this, socket_id, connection->getErrorCode());
					 }
					 return;
				 }
			 }

			 // 消息来了, 回调函数处理
			 if (data_arrive) {
				 if (recv_message_cb_) {
					 recv_message_cb_(this, socket_id, &read_buffer);
				 }
			 }

			 // 连接断开了
			 if (peer_close) {
				 if (data_arrive) {
					 if (connections_.find(socket_id) == connections_.end()) {
						 return;
					 }
				 }

				 connection->setStatus(TcpConnection::Status::PEER_CLOSED);
				 if (peer_close_cb_) {
					 peer_close_cb_(this, socket_id);
				 }
			 }

		 }

		 void Reactor::setRecvMessageCallback(const RecvMessageCallback &recv_message_cb)
		 {
			 recv_message_cb_ = recv_message_cb;
		 }

		 void Reactor::setPeerCloseCallback(const PeerCloseCallback &peer_close_cb)
		 {
			 peer_close_cb_ = peer_close_cb;
		 }

		 void Reactor::setErrorCallback(const ErrorCallback &error_cb)
		 {
			 error_cb_ = error_cb;
		 }


		 // 出错了
		 void Reactor::onSocketError(IODevice *io_device)
		 {

		 }


		 // 消息需要发送
		 void Reactor::onSocketWrite(IODevice *io_device)
		 {

		 }

		 bool Reactor::isConnected(SocketId socket_id)
		 {

		 }

		 bool  Reactor::getLocalAddress(SocketId socket_id, SocketAddress *addr) const
		 {

		 }

		 bool Reactor::getPeerAddress(SocketId socket_id, SocketAddress *addr) const
		 {

		 }

		 bool Reactor::sendMessage(SocketId socket_id, const char *buffer, size_t size, const SendCompleteCallback &send_complete_cb)
		 {

		 }

		 bool Reactor::sendMessageThenClose(SocketId socket_id, const char *buffer, size_t size)
		 {

		 }

		 void Reactor::broadcastMessage(const char *buffer, size_t size)
		 {

		 }

	} // namespace net
} // namespace zbluenet