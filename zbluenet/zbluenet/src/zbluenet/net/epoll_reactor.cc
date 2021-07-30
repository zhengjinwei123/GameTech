#include <zbluenet/net/epoll_reactor.h>
#include <zbluenet/timestamp.h>
#include <zbluenet/net/io_device.h>

#ifndef _WIN32

namespace zbluenet {
	namespace net {
		EpollReactor::EpollReactor(int max_socket_num) : 
			Reactor(max_socket_num)
		{
			epoller_.create(max_socket_num);
		}

		EpollReactor::~EpollReactor()
		{

		}

		bool EpollReactor::addIODevice(IODevice *io_device)
		{
			return epoller_.add(io_device);
		}

		bool EpollReactor::removeIODevice(IODevice *io_device)
		{
			return epoller_.del(io_device);
		}

		void EpollReactor::closeSocket(SocketId socket_id)
		{
			auto iter = sockets_.find(socket_id);
			if (iter == sockets_.end()) {
				return;
			}
			iter->second->detachIOService();
			Reactor::closeSocket(socket_id);

		}

		bool EpollReactor::attachSocket(std::unique_ptr<TcpSocket> &peer_socket)
		{
			if (false == checkExists(peer_socket->getId())) {
				return false;
			}

			if (false == peer_socket->attachIOService(this)) {
				return false;
			}

			if (false ==  Reactor::attachSocket(peer_socket)) {
				return false;
			}
			return true;
		}

		void EpollReactor::loop()
		{
			quit_ = false;
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