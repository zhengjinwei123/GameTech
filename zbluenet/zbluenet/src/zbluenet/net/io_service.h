#ifndef ZBLUENET_NET_IO_SERVICE_H
#define ZBLUENET_NET_IO_SERVICE_H

#include <functional>
#include <stdint.h>
#include <hash_set>
#include <vector>

#include <zbluenet/class_util.h>
#include <zbluenet/timer_heap.h>

namespace zbluenet {
	namespace net {

		class IODevice;

		class IOService : public Noncopyable {
		public:
			typedef int64_t TimerId;
			using TimerCallback = std::function<void (TimerId)>;

			IOService();
			virtual ~IOService();

			virtual void loop() = 0;
			void quit();

			TimerId startTimer(int64_t timeout_ms, const TimerCallback &timer_cb, int call_times = -1);
			void stopTimer(TimerId timer_id);
			
		protected:
			friend class IODevice;
			virtual bool addIODevice(IODevice *io_device) = 0;
			virtual bool removeIODevice(IODevice *io_device) = 0;
			virtual bool updateIODevice(IODevice *io_device) = 0;

		protected:
			bool quit_;
			TimerHeap timer_heap_;
		};
	} // namespace net
} // namespace zbluenet
#endif //ZBLUENET_NET_REACTOR_H
