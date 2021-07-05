#ifndef ZBLUENET_NET_FDSET_H
#define ZBLUENET_NET_FDSET_H

#include <zbluenet/net/platform.h>

namespace zbluenet {
	namespace net {
		class FDSet {
		public:
			FDSet();
			~FDSet();

			void create(int max_fds);
			void destroy();

			void add(SOCKET sock);
			void remove(SOCKET sock);
			void reset();
			bool checkExists(SOCKET sock);
			fd_set* getFDSet() { return pfd_set_;  }
			void copy(FDSet& other);
		private:
			fd_set  *pfd_set_;
			size_t  fd_size_;
			int max_socket_fd_;
		};
	} // namespace net
} // namespace zbluenet

#endif // ZBLUENET_NET_FDSET_H
