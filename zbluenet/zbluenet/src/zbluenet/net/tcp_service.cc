#include <zbluenet/net/tcp_service.h>
#include <zbluenet/net/platform.h>

#include <memory>


namespace zbluenet {
	namespace net {

		TcpService::TcpService(IOService &io_service) :
			io_service_(io_service_),
			conn_read_buffer_init_size_(0),
			conn_read_buffer_expand_size_(0),
			conn_read_buffer_max_size_(0),
			conn_write_buffer_init_size_(0),
			conn_write_buffer_expand_size_(0),
			conn_write_buffer_max_size_(0)
		{

		}

		TcpService::~TcpService()
		{
			for (TcpConnectionMap::iterator iter = connections_.begin(); iter != connections_.end(); ++iter) {
				delete iter->second;
			}

			for (TcpSocketMap::iterator iter = sockets_.begin(); iter != sockets_.end(); ++iter) {
				delete iter->second;
			}
		}

		IOService *TcpService::getIOService() const
		{
			return io_service_;
		}

		TcpService::SocketId TcpService::listen(const SocketAddress &addr)
		{
			std::unique_ptr<TcpSocket> socket(new TcpSocket());

			if (socket->passiveOpenNonblock(addr) == false) {
				return INVALID_SOCKET;
			}

			return buildListenSocket(socket);
		}

		TcpService::SocketId TcpService::shareListen(const TcpSocket &shared_socket)
		{
			return INVALID_SOCKET;
		}

		bool TcpService::isConnected(SocketId socket_id) const
		{
			TcpConnectionMap::const_iterator iter = connections_.find(socket_id);
			if (connections_.end() == iter) {
				return false;
			}
			TcpConnection *connection = iter->second;
			return connection->getStatus() == TcpConnection::Status::CONNECTED;
		}

		bool TcpService::getLocalAddress(SocketId socket_id, SocketAddress *addr) const
		{
			TcpSocketMap::const_iterator iter = sockets_.find(socket_id);
			if (iter == sockets_.end()) {
				return false;
			}
			return iter->second->getLocalAddress(addr);
		}

		bool TcpService::getPeerAddress(SocketId socket_id, SocketAddress *addr) const
		{
			TcpSocketMap::const_iterator iter = sockets_.find(socket_id);
			if (iter == sockets_.end()) {
				return false;
			}
			return iter->second->getPeerAddress(addr);
		}

		bool TcpService::sendMessage(SocketId socket_id, const char *buffer, size_t size,
			const SendCompleteCallback &send_complete_cb = nullptr)
		{
			TcpConnectionMap::iterator iter = connections_.find(socket_id);
			if (connections_.end() == iter) {
				return false;
			}
			TcpConnection *connection = iter->second;
			return sendMessage(connection, buffer, size, send_complete_cb);
		}

		bool TcpService::sendMessageThenClose(SocketId socket_id, const char *buffer, size_t size)
		{
			return sendMessage(socket_id, buffer, size, std::bind(&TcpService::sendCompleteCloseCallback,
				this, std::placeholders::_1, std::placeholders::_2));
		}

		void TcpService::broadcastMessage(const char *buffer, size_t size)
		{
			for (TcpConnectionMap::iterator iter = connections_.begin(); iter != connections_.end(); ++iter) {
				TcpConnection *connection = iter->second;
				sendMessage(connection, buffer, size, nullptr);
			}
		}

		void TcpService::closeSocket(SocketId socket_id)
		{

		}

		void TcpService::setNewConnectionCallback(const NewConnectionCallback &new_conn_cb)
		{

		}

		void TcpService::setRecvMessageCallback(const RecvMessageCallback &recv_message_cb)
		{

		}

		void TcpService::setPeerCloseCallback(const PeerCloseCallback &peer_close_cb)
		{

		}

		void TcpService::setErrorCallback(const ErrorCallback &error_cb)
		{

		}

		void TcpService::recvBufferInit(size_t init_size, size_t expand_size, size_t max_size)
		{

		}

		void TcpService::sendBufferInit(size_t init_size, size_t expand_size, size_t max_size)
		{

		}


		TcpService::SocketId TcpService::buildListenSocket(std::unique_ptr<TcpSocket> &socket)
		{

		}

		TcpService::SocketId TcpService::buildConnectedSocket(std::unique_ptr<TcpSocket> &socket)
		{

		}

		TcpService::SocketId TcpService::buildAsyncConnectedSocket(std::unique_ptr<TcpSocket> &socket, int timeout_ms)
		{

		}

		void TcpService::addSocketTimer(SocketId socket_id, int timeout_ms, TimerCallback timer_cb)
		{

		}

		void TcpService::removeSocketTimer(SocketId socket_id)
		{

		}

		void TcpService::onListenSocketRead(IODevice *io_device)
		{

		}

		int TcpService::onSocketRead(IODevice *io_device)
		{

		}

		int TcpService::onSocketWrite(IODevice *io_device)
		{

		}

		int TcpService::onSocketError(IODevice *io_device)
		{

		}

		bool TcpService::sendMessage(TcpConnection *connection, const char *buffer, size_t size,
			const SendCompleteCallback &send_complete_cb)
		{
			if (connection->getStatus() != TcpConnection::Status::CONNECTED) {
				return false;
			}
			TcpSocket *socket = connection->getSocket();
			DynamicBuffer &write_buffer = connection->getWriteBuffer();
			size_t remain_size = size;

			if (write_buffer.readableBytes() == 0) {
				// 直接发送
				int write_size = socket->send(buffer, size);
				if (write_size < 0) {
					if (errno != EAGAIN) {
						connection->setError(errno);
						addSocketTimer(socket->getId(), 0, std::bind(&TcpService::onSendMessageError, this, std::placeholders::_1));
						return false;
					}
				} else {
					remain_size -= write_size;
				}
			}

			if (remain_size > 0) {
				// 检查缓冲是否溢出
				if  (conn_write_buffer_max_size_ > 0 && remain_size + write_buffer.readableBytes() > conn_write_buffer_max_size_) {
					connection->setError(ENOBUFS);
					addSocketTimer(socket->getId(), 0, std::bind(&TcpService::onSendMessageError, this, std::placeholders::_1));
					return false;
				}

				// 没有溢出, 存到緩衝區
				write_buffer.reserveWritableBytes(remain_size);
				::memcpy(write_buffer.writeBegin(), buffer, remain_size);
				write_buffer.write(remain_size);
				connection->setSendCompleteCallback(send_complete_cb);
				socket->setWriteCallback(std::bind(&TcpService::onSocketWrite, this, std::placeholders::_1));
				// select 模式需要手動激活写事件
				socket->activeWriteEvent();
			} else {
				if (send_complete_cb) {
					send_complete_cb(this, socket->getId());
				}
			}

			return true;
		}

		void TcpService::onSendMessageError(TimerId timer_id)
		{
			TimerIdSocketIdMap::iterator iter = timer_to_socket_map_.find(timer_id);
			if (iter == timer_to_socket_map_.end()) {
				return;
			}

			SocketId socket_id = iter->second;
			timer_to_socket_map_.erase(iter);
			socket_to_timer_map_.erase(socket_id);

			TcpSocketMap::iterator iter2 = sockets_.find(socket_id);
			if (sockets_.end() == iter2) {
				return;
			}

			TcpConnectionMap::iterator iter3 = connections_.find(socket_id);
			if (connections_.end() == iter3) {
				return;
			}

			TcpSocket *socket = iter2->second;
			TcpConnection *connection = iter3->second;

			if (error_cb_) {
				error_cb_(this, socket->getId(), connection->getErrorCode());
			}
		}

		void TcpService::sendCompleteCloseCallback(TcpService *service, SocketId socket_id)
		{
			service->closeSocket(socket_id);
		}

	} // namespace net 
} // namespace zbluenet