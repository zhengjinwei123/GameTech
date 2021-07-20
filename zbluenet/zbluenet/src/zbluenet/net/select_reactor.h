#ifndef ZBLUENET_NET_SELECT_REACTOR_H
#define ZBLUENET_NET_SELECT_REACTOR_H

#include <zbluenet/class_util.h>
#include <zbluenet/net/reactor.h>
#include <zbluenet/net/fd_set.h>

namespace zbluenet {
	namespace net {

		class SelectReactor : public Reactor {
		public:
			SelectReactor(int max_connection_num) : Reactor(max_connection_num)
			{
				fd_read_.create(max_connection_num);
				fd_write_.create(max_connection_num);
				fd_read_back_.create(max_connection_num);
			}

			virtual ~SelectReactor() {}

			virtual void loop(Thread *pthread);

		private:
			FDSet fd_read_;
			FDSet fd_write_;
			FDSet fd_read_back_;
		};
	} // namespace net 
} // namespace zbluenet
#endif // ZBLUENET_NET_SELECT_EVENT_LOOP_H
