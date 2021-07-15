#ifndef ZBLUENET_NET_TCP_SERVICE_H
#define ZBLUENET_NET_TCP_SERVICE_H

#include <zbluenet/class_util.h>
#include <zbluenet/net/io_service.h>
#include <zbluenet/net/socket_id_allocator.h>
#include <zbluenet/net/tcp_connection.h>

#include <functional>
#include <stdint.h>
#include <memory>
#include <unordered_map>

namespace zbluenet {

	class DynamicBuffer;


	namespace net {
		class SocketAddress;
		class TcpSocket;

		class TcpService : public Noncopyable {
		public:
			typedef int64_t  SocketId; // ”…socketid allocator ∑÷≈‰µƒid
			using NewConnectionCallback = std::function<void (TcpService *, SocketId, SocketId)>;
			using RecvMessageCallback = std::function<void (TcpService *, SocketId, DynamicBuffer *)>;
			using PeerCloseCallback = std::function<void(TcpService *, SocketId)>;
			using ErrorCallback = std::function<void (TcpService *, SocketId, int)>;
			using SendCompleteCallback = std::function<void(TcpService *, SocketId)>;
			using TimerId = IOService::TimerId;
			using TimerCallback = IOService::TimerCallback;

			using TcpSocketMap = std::unordered_map<SocketId, TcpSocket*>;
			using TcpConnectionMap = std::unordered_map<SocketId, TcpConnection *>;
			using SocketIdTimerIdMap = std::unordered_map<SocketId, TimerId>;
			using TimerIdSocketIdMap = std::unordered_map<TimerId, SocketId>;



			explicit TcpService(IOService &io_service);
			~TcpService();

			IOService *getIOService() const;
			SocketId listen(const SocketAddress &addr);
			SocketId shareListen(const TcpSocket &shared_socket);

			bool isConnected(SocketId socket_id) const;
			bool getLocalAddress(SocketId socket_id, SocketAddress *addr) const;
			bool getPeerAddress(SocketId socket_id, SocketAddress *addr) const;

			bool sendMessage(SocketId socket_id, const char *buffer, size_t size,
				const SendCompleteCallback &send_complete_cb = nullptr);
			bool sendMessageThenClose(SocketId socket_id, const char *buffer, size_t size);
			void broadcastMessage(const char *buffer, size_t size);
			void closeSocket(SocketId socket_id);

			void setNewConnectionCallback(const NewConnectionCallback &new_conn_cb);
			void setRecvMessageCallback(const RecvMessageCallback &recv_message_cb);
			void setPeerCloseCallback(const PeerCloseCallback &peer_close_cb);
			void setErrorCallback(const ErrorCallback &error_cb);

			void recvBufferInit(size_t init_size = 1024, size_t expand_size = 1024, size_t max_size = 0);
			void sendBufferInit(size_t init_size = 1024, size_t expand_size = 1024, size_t max_size = 0);

		private:
			SocketId buildListenSocket(std::unique_ptr<TcpSocket> &socket);
			SocketId buildConnectedSocket(std::unique_ptr<TcpSocket> &socket);
			SocketId buildAsyncConnectedSocket(std::unique_ptr<TcpSocket> &socket, int timeout_ms);

			void addSocketTimer(SocketId socket_id, int timeout_ms , TimerCallback timer_cb);
			void removeSocketTimer(SocketId socket_id);

			void onListenSocketRead(IODevice *io_device);
			
			int onSocketRead(IODevice *io_device);
			int onSocketWrite(IODevice *io_device);
			int onSocketError(IODevice *io_device);

			bool sendMessage(TcpConnection *connection, const char *buffer, size_t size,
				const SendCompleteCallback &send_complete_cb);
			void onSendMessageError(TimerId timer_id);
			void sendCompleteCloseCallback(TcpService *service, SocketId socket_id);

		private:
			IOService *io_service_;

			SocketIdAllocator socket_id_allocator_;
			TcpSocketMap sockets_;
			TcpConnectionMap connections_;
			SocketIdTimerIdMap socket_to_timer_map_;
			TimerIdSocketIdMap timer_to_socket_map_;

			NewConnectionCallback new_conn_cb_;
			RecvMessageCallback recv_message_cb_;
			PeerCloseCallback peer_close_cb_;
			ErrorCallback error_cb_;

			size_t conn_read_buffer_init_size_;
			size_t conn_read_buffer_expand_size_;
			size_t conn_read_buffer_max_size_;

			size_t conn_write_buffer_init_size_;
			size_t conn_write_buffer_expand_size_;
			size_t conn_write_buffer_max_size_;
		};

	} // namespace net
} // namespace zbluenet

#endif // ZBLUENET_NET_TCP_SERVICE_H
