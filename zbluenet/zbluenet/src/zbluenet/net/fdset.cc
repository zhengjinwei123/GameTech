#include <zbluenet/net/fdset.h>

namespace zbluenet {
	namespace net {


		FDSet::FDSet() :pfd_set_(nullptr), fd_size_(0), max_socket_fd_(0)
		{

		}

		FDSet::~FDSet()
		{
			destroy();
		}

		void FDSet::create(int max_fds)
		{
			if (max_fds > (int)FD_SETSIZE) {
				max_fds = (int)FD_SETSIZE;
			}

			int socket_num = max_fds;

#ifdef _WIN32
			if (socket_num < 64) {
				socket_num = 64;
			}
			fd_size_ = sizeof(u_int) + (sizeof(SOCKET) * socket_num);
#else
			//if (socket_num < (int)FD_SETSIZE)
			//	socket_num = (int)FD_SETSIZE;
			fd_size_ = socket_num / (8 * sizeof(char)) + 1;
#endif // _WIN32
			pfd_set_ = (fd_set *)new char[fd_size_];
			memset(pfd_set_, 0, fd_size_);
			max_socket_fd_ = socket_num;
		}

		void FDSet::destroy()
		{
			if (pfd_set_ != nullptr) {
				delete[] pfd_set_;
				pfd_set_ = nullptr;
			}
		}

		inline void FDSet::add(SOCKET sock) 
		{
#ifdef _WIN32
			FD_SET(sock, pfd_set_);
#else
			if (sock < max_socket_fd_) {
				FD_SET(sock, pfd_set_);
			}
#endif // _WIN32
		}

		inline void FDSet::remove(SOCKET sock)
		{
			FD_CLR(sock, pfd_set_);
		}

		inline void FDSet::reset()
		{
#ifdef _WIN32
			FD_ZERO(pfd_set_);
#else
			memset(pfd_set_, 0, fd_size_);
#endif // _WIN32
		}

		inline bool FDSet::checkExists(SOCKET sock)
		{
			return FD_ISSET(sock, pfd_set_);
		}

		void FDSet::copy(FDSet& other)
		{
			memcpy(pfd_set_, other.getFDSet(), other.fd_size_);
		}
	} // namespace net
} // namespace zbluenet