#ifndef ZBLUENET_NET_IO_DEVICE_H
#define ZBLUENET_NET_IO_DEVICE_H

#include <zbluenet/class_util.h>
#include <stdint.h>
#include <functional>

namespace zbluenet {
	namespace net {

		class IODevice : public Noncopyable {
		public:
			using EventCallback = std::function< void (IODevice *)>;

		public:
			IODevice():
				id_(0)
			{

			}

			virtual ~IODevice() {}
			void setId(int64_t id) { id_ = id; }
			const int64_t getId() const { return id_;  }

			void setReadCallback(const EventCallback &read_cb)
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

			const EventCallback &getReadCallback() const { return read_cb_;  }
			const EventCallback &getWriteCallback() const { return write_cb_;  }
			const EventCallback &getErrorCallback() const { return error_cb_;  }

		protected:
			int64_t id_;
			EventCallback read_cb_;
			EventCallback write_cb_;
			EventCallback error_cb_;
		};

	} // namespace net
} // namespace zbluenet

#endif // ZBLUENET_NET_IO_DEVICE_H
