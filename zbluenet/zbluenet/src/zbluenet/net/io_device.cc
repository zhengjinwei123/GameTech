#include <zbluenet/net/io_device.h>

#include <zbluenet/net/io_service.h>
#include <zbluenet/net/platform.h>
#include <fcntl.h>

namespace zbluenet {
	namespace net {
		IODevice::IODevice() :
			io_service_(nullptr),
			id_(0),
			fd_(-1),
			write_event_active_(false)
		{

		}
		IODevice::~IODevice()
		{
			detachIOService();
		}

		bool IODevice::attachIOService(IOService &io_service)
		{
			if (io_service_ != nullptr) {
				detachIOService();
			}
		}

		void IODevice::detachIOService()
		{

		}

		void IODevice::setReadCallback(const EventCallback &read_cb)
		{
			read_cb_ = read_cb;
			if (io_service_ != nullptr) {
				io_service_->updateIODevice(this);
			}
		}

		void IODevice::setWriteCallback(const EventCallback &write_cb)
		{
			write_cb_ = write_cb;
			if (io_service_ != nullptr) {
				io_service_->updateIODevice(this);
			}
		}

		void IODevice::setErrorCallback(const EventCallback &error_cb)
		{
			error_cb_ = error_cb;
		}

		int IODevice::read(char *buffer, size_t size)
		{
#ifdef _WIN32

#else
			return ::read(fd_, buffer, size);
#endif
		}
		
		int IODevice::write(const char *buffer, size_t size)
		{
#ifdef _WIN32

#else
			return ::write(fd_, buffer, size);
#endif
		}
		bool IODevice::setNonblock()
		{
#ifdef _WIN32

#else
			int flags = ::fcntl(fd_, F_GETFL, 0);
			if (::fcntl(fd_, F_SETFL, flags | O_NONBLOCK) != 0) {
				return false;
			}

			return true;
#endif
		}

		bool IODevice::setCloseOnExec()
		{
#ifdef _WIN32

#else
			int flags = ::fcntl(fd_, F_GETFD, 0);
			if (::fcntl(fd_, F_SETFD, flags | FD_CLOEXEC) != 0) {
				return false;
			}

			return true;
#endif
		}

	} // namespace net
} // namespace zbluenet