#ifndef ZBLUENET_NET_TCP_CONNECTION_H
#define ZBLUENET_NET_TCP_CONNECTION_H

#include <zbluenet/net/platform.h>
#include <zbluenet/dynamic_buffer.h>
#include <zbluenet/net/tcp_socket.h>
#include <zbluenet/class_util.h>


#include <stdint.h>
#include <cstddef>

namespace zbluenet {
	namespace net {

		class TcpService;

		class TcpConnection : public Noncopyable {
		public:
			struct Status {
				enum type {
					NONE,
					CONNECTING,
					CONNECTED,
					PEER_CLOSED,
					PENDING_ERROR,
				};
			};
			typedef int64_t  SocketId; // ”…socketid allocator ∑÷≈‰µƒid
			using SendCompleteCallback = std::function<void(TcpService *, SocketId)>;

			TcpConnection(TcpSocket *socket, size_t read_buffer_init_size, 
				size_t read_buffer_expand_size,
				size_t write_buffer_init_size,
				size_t write_buffer_expand_size);
			~TcpConnection() {}
			TcpSocket *getSocket() { return socket_;  }
			Status::type getStatus() const { return status_;  }
			int getErrorCode() const { return error_code_;  }
			DynamicBuffer &getReadBuffer() { return read_buffer_; }
			DynamicBuffer &getWriteBuffer() { return write_buffer_;  }
			void setStatus(Status::type status) { status_ = status; }
			void setError(int error_code);

			const SendCompleteCallback &getSendCompleteCallback() const {
				return send_complete_cb_;
			}
			void setSendCompleteCallback(
				const SendCompleteCallback &send_complete_cb)
			{
				send_complete_cb_ = send_complete_cb;
			}

		private:
			TcpSocket *socket_;
			Status::type status_;
			int error_code_;
			DynamicBuffer read_buffer_;
			DynamicBuffer write_buffer_;
			SendCompleteCallback send_complete_cb_;
		};

	} // namespace net
} // namespace zbluenet

#endif // ZBLUENET_NET_TCP_CONNECTION_H
