#ifndef ZBLUENET_NET_IO_DEVICE_H
#define ZBLUENET_NET_IO_DEVICE_H

#include <zbluenet/class_util.h>
#include <zbluenet/net/platform.h>
#include <zbluenet/net/io_service.h>
#include <stdint.h>
#include <functional>

namespace zbluenet {
	namespace net {

		class IODevice : public Noncopyable {
		public:
			using EventCallback = std::function< void (IODevice *)>;
			using ReadCallback = std::function< int (IODevice *)>;

		public:
			IODevice():
				id_(0),
				fd_(-1),
				io_service_(nullptr)
			{

			}

			virtual ~IODevice() 
			{
				detachIOService();
			}

			void setId(int64_t id) { id_ = id; }
			const int64_t getId() const { return id_;  }

			void setFD(SOCKET fd) { fd_ = fd; }
			SOCKET getFD() const { return fd_; }

			bool attachIOService(IOService &io_service)
			{
				if (io_service_ != nullptr) {
					detachIOService();
				}
				if (io_service.addIODevice(this) == false) {
					return false;
				}
				io_service_ = &io_service;
				return true;
			}

			void detachIOService()
			{
				if (nullptr == io_service_) {
					return;
				}
				io_service_->removeIODevice(this);
				io_service_ = nullptr;
			}

			void setReadCallback(const ReadCallback &read_cb)
			{
				read_cb_ = read_cb;
			}

			void setWriteCallback(const EventCallback &write_cb)
			{
				write_cb_ = write_cb;
			}

			void setErrorCallback(const EventCallback &error_cb)
			{
				error_cb_ = error_cb;
			}

			const ReadCallback &getReadCallback() const { return read_cb_;  }
			const EventCallback &getWriteCallback() const { return write_cb_;  }
			const EventCallback &getErrorCallback() const { return error_cb_;  }

		protected:
			int64_t id_;
			SOCKET fd_;
			ReadCallback read_cb_;
			EventCallback write_cb_;
			EventCallback error_cb_;
			IOService *io_service_;
		};

	} // namespace net
} // namespace zbluenet

#endif // ZBLUENET_NET_IO_DEVICE_H
