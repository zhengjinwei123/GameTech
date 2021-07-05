#ifndef ZBLUENET_NET_NETWORK_H
#define ZBLUENET_NET_NETWORK_H

#include <zbluenet/net/platform.h>
#include <zbluenet/class_util.h>
#include <zbluenet/logger_base.h>
#ifndef _WIN32
#include <fcntl.h>
#include <stdlib.h>
#endif

namespace zbluenet {
	namespace net {
		class NetWork : public Noncopyable {
		public:
			NetWork()
			{
#ifdef _WIN32
				WORD ver = MAKEWORD(2, 2);
				WSADATA data;
				WSAStartup(ver, &data);
#else
				// 忽略异常信号， 默认情况会导致进程终止
				signal(SIGPIPE, SIG_IGN);
#endif
			}

			~NetWork()
			{
#ifdef _WIN32
				WSACleanup();
#endif
			}

		public:
			static void Init()
			{
				static NetWork tmp;
			}

			static int makeNonblock(SOCKET fd)
			{
#ifdef _WIN32
				{
					unsigned long nonblocking = 1;
					if (ioctlsocket(fd, FIONBIO, &nonblocking) == SOCKET_ERROR) {
						BASE_WARNING("ioctlsocket set nonbloking error (%d)", (int)fd);
						return-1;
					}
				}
			
#else
				{
					int flags;
					if ((flags = fcntl(fd, F_GETFL, nullptr)) < 0) {
						BASE_WARNING("fcntl(%d, F_GETFL) error", (int)fd);
						return -1;
					}
					if (!(flags & O_NONBLOCK)) {
						if (fcntl(fd, F_SETFL, flags | O_NONBLOCK) == -1) {
							BASE_WARNING("fcntl(%d, F_SETFL) set nonblock error", (int)fd);
							return -1;
						}
					}
				}
				
#endif // _WIN32

				return 0;
			}

			static int makeReuseAddr(SOCKET fd)
			{
				int flags = 1;
				if (SOCKET_ERROR == setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, (const char *)&flags, sizeof(flags))) {
					BASE_WARNING("makeReuseAddr error (%d)", (int)fd);
					return SOCKET_ERROR;
				}

				return 0;
			}

			static int makeTcpNoDelay(SOCKET fd)
			{
				int flag = 1;
				if (SOCKET_ERROR == setsockopt(fd, IPPROTO_TCP, TCP_NODELAY, (const char *)&flag, sizeof(flag))) {
					BASE_WARNING("makeTcpNoDelay error (%d)", (int)fd);
					return SOCKET_ERROR;
				}
				return 0;
			}

			static int destroySocket(SOCKET fd)
			{
#ifdef _WIN32
				int ret = closesocket(fd);
#else
				int ret = close(fd);
#endif // _WIN32
				if (ret < 0) {
					BASE_ERROR("destroySocket error (%d)", (int)fd);
				}
				return ret;
			}
		};
	} // namespace net
} // namespace zbluenet

#endif //ZBLUENET_NET_NETWORK_H 
