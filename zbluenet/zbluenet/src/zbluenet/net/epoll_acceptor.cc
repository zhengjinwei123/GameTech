#include <zbluenet/net/epoll_acceptor.h>

#include <zbluenet/timestamp.h>

#ifndef _WIN32
namespace zbluenet {
	namespace net {

		EPollAcceptor::EPollAcceptor(TcpSocket *listen_socket, uint16_t max_socket_num) :
			Acceptor(listen_socket, max_socket_num)
		{
			epoller_.create(max_socket_num);
			epoller_.add(listen_socket);
		}

		EPollAcceptor::~EPollAcceptor()
		{
			epoller_.del(listen_socket_);
			epoller_.destroy();
		}

       void EPollAcceptor::loop()
	   {
		   Timestamp now;
		   while (!quit_) {
			   now.setNow();
			   int timer_timeout = timer_heap_.getNextTimeoutMillisecond(now);

			   int ret = epoller_.doEvent(timer_timeout);
			   if (ret == -1) {
				   quit_ = true;
				   break;
			   }

			   now.setNow();
			   checkTimeout(now);
		   }
	   }

	} // namespace net
} // namespace zbluenet

#endif