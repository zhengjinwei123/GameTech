#include <zbluenet/net/tcp_socket.h>

#include <zbluenet/net/network.h>

#ifdef _WIN32

#else
#include <unistd.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <cerrno>
#endif

namespace zbluenet {
	namespace net {
		TcpSocket::TcpSocket()
		{

		}

		TcpSocket::~TcpSocket()
		{

		}

		bool TcpSocket::open(SocketAddress::Protocol::type protocol)
		{

		}

		void TcpSocket::close()
		{

		}

		bool TcpSocket::connect(const SocketAddress &addr)
		{

		}

		bool TcpSocket::bind(const SocketAddress &addr)
		{

		}

		bool TcpSocket::listen(int backlog)
		{

		}

		bool TcpSocket::accept(TcpSocket *peer_socket)
		{

		}

		bool TcpSocket::getLocalAddress(SocketAddress *addr) const
		{

		}

		bool TcpSocket::getPeerAddress(SocketAddress *addr) const
		{

		}

		int TcpSocket::readableBytes() const
		{

		}

		int TcpSocket::recv(char *buffer, size_t size)
		{

		}

		int TcpSocket::send(const char *buffer, size_t size)
		{

		}

		bool TcpSocket::shutdownRead()
		{

		}

		bool TcpSocket::shutdownWrite()
		{

		}

		bool TcpSocket::shutdownBoth()
		{

		}

		int TcpSocket::getSocketError()
		{

		}


		int TcpSocket::getSocketError()
		{

		}


		bool TcpSocket::setReuseAddr()
		{

		}

		bool TcpSocket::setTcpNoDelay()
		{

		}


		// 客户端发起连接
		/************************************************************************/
		/* open setReuseAaddr setTcpNodealy connect                                                                     */
		/************************************************************************/
		bool TcpSocket::activeOpen(const SocketAddress &remote_addr)
		{

		}

		/************************************************************************/
		/* activeOpen setNonblock                                                                     */
		/************************************************************************/
		bool TcpSocket::activeOpenNonblock(const SocketAddress &remote_addr)
		{

		}

		// 创建服务
		/************************************************************************/
		/* open setReuseAddr setTcpNodelay bind listen(128)                                                                     */
		/************************************************************************/
		bool TcpSocket::passiveOpen(const SocketAddress &local_addr)
		{

		}

		/************************************************************************/
		/* passiveOpen setNonblock                                                                     */
		/************************************************************************/
		bool TcpSocket::passiveOpenNonblock(const SocketAddress &local_addr)
		{

		}

		/************************************************************************/
		/* accept setTcpNodelay setNonblock                                                                     */
		/************************************************************************/
		bool TcpSocket::acceptNonblock(TcpSocket *peer)
		{

		}










	} // namespace net
}// namespace zbluenet
