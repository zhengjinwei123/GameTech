#ifndef ZBLUENET_NET_IO_DEVICE_H
#define ZBLUENET_NET_IO_DEVICE_H

#include <stdint.h>
#include <cstddef>
#include <functional>

#include <zbluenet/class_util.h>

namespace zbluenet {
	namespace net {

		class IOService;

		class IODevice : public Noncopyable {
		public:
			typedef int DescriptorID;
			using EventCallback = std::function<int (IODevice *)>;

			IODevice();
			virtual ~IODevice();

			bool attachIOService(IOService &io_service);
			void detachIOService();
			int64_t getId() const { return id_;  }
			void setId(int64_t id) { id_ = id; }
			DescriptorID getDescriptorId() const { return fd_;  }
			void setDescriptorId(DescriptorID fd) { fd_ = fd;  }

			const EventCallback &getReadCallback() const { return read_cb_;  }
			const EventCallback &getWriteCallback() const { return write_cb_;  }
			const EventCallback &getErrorCallback() const { return error_cb_; }
			void setReadCallback(const EventCallback &read_cb);
			void setWriteCallback(const EventCallback &write_cb);
			void setErrorCallback(const EventCallback &error_cb);

			virtual int read(char *buffer, size_t size);
			virtual int write(const char *buffer, size_t size);
			virtual bool setNonblock();
			virtual bool setCloseOnExec();

			virtual bool isWriteEventActive() const { return write_event_active_; }
			virtual void activeWriteEvent() { write_event_active_ = true;  }
			virtual void disableWriteEvent() { write_event_active_ = false;  }

		protected:
			IOService *io_service_;
			int64_t id_;
			DescriptorID fd_;
			EventCallback read_cb_;
			EventCallback write_cb_;
			EventCallback error_cb_;

			bool write_event_active_;
		};
	} // namespace net
} // namespace zbluenet

#endif // ZBLUENET_NET_IO_DEVICE_H
