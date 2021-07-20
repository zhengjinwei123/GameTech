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

		class SocketAddress;

		class Reactor : public Noncopyable {
		public:
			using SocketId = TcpSocket::SocketId;
			using RecvMessageCallback = std::function<void (Reactor *, SocketId, DynamicBuffer *)>;
			using PeerCloseCallback = std::function<void (Reactor *, SocketId)>;
			using ErrorCallback = std::function<void (Reactor *, SocketId, int)>;
			using SendCompleteCallback = std::function<void(Reactor *, SocketId)>;

		public:
			using TcpSocketMap = std::unordered_map<SocketId, TcpSocket *>;
			using TcpConnectionMap = std::unordered_map<SocketId, TcpConnection *>;

		public:
			Reactor(int max_connection_num);
			virtual ~Reactor();
			void setRecvBufferInitSize(size_t size);
			void setRecvBufferExpandSize(size_t size);
			void setRecvBufferMaxSize(size_t size);
			////
			void setSendBufferInitSize(size_t size);
			void setSendBufferExpandSize(size_t size);
			void setSendBufferMaxSize(size_t size);

			void init(uint16_t id);

	

			void start();

			const size_t getConnectionNum() const { return connections_.size();  }

			virtual void loop(Thread *pthread) = 0;
			virtual void quit();

		public:
			void setRecvMessageCallback(const RecvMessageCallback &recv_message_cb);
			void setPeerCloseCallback(const PeerCloseCallback &peer_close_cb);
			void setErrorCallback(const ErrorCallback &error_cb);

			bool isConnected(SocketId socket_id);
			bool getLocalAddress(SocketId socket_id, SocketAddress *addr) const;
			bool getPeerAddress(SocketId socket_id, SocketAddress *addr) const;

			bool sendMessage(SocketId socket_id, const char *buffer, size_t size, const SendCompleteCallback &send_complete_cb = nullptr);
			bool sendMessageThenClose(SocketId socket_id, const char *buffer, size_t size);
			void broadcastMessage(const char *buffer, size_t size);
			// 解绑
			void closeSocket(SocketId socket_id);
			// 绑定socket
			bool attachSocket(std::unique_ptr<TcpSocket> &peer_socket);


		protected:
			void onSocketRead(IODevice *io_device);// 消息到来
			void onSocketWrite(IODevice *io_device); // 消息发送
			void onSocketError(IODevice *io_device); // 出错处理

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

			RecvMessageCallback recv_message_cb_;
			PeerCloseCallback peer_close_cb_;
			ErrorCallback error_cb_;
		};
	} // namespace net 
} // namespace zbluenet
#endif // ZBLUENET_NET_REACTOR_H
