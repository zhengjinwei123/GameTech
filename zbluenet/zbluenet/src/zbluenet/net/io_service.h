#ifndef ZBLUENET_NET_IO_SERVICE_H
#define ZBLUENET_NET_IO_SERVICE_H

#include <zbluenet/class_util.h>
#include <zbluenet/timer_heap.h>
#include <zbluenet/timestamp.h>
#include <zbluenet/net/io_device.h>

#include <stdint.h>
#include <functional>

namespace zbluenet {
	namespace net {

		class IOService: public Noncopyable {
		public:
			using TimerId = int64_t;
			using TimerCallback = std::function<void(TimerId)>;

		public:
			IOService() : quit_(false) {}
			virtual ~IOService() {}

			virtual void loop() = 0;
			void quit() { quit_ = true;  }

			virtual bool addIODevice(IODevice *io_device)
			{
				return true;
			}

			virtual bool removeIODevice(IODevice *io_device)
			{
				return true;
			}

			TimerId startTimer(int64_t timeout_ms, const TimerCallback &timer_cb, int call_times = -1)
			{
				Timestamp now;
				return timer_heap_.addTimer(now, timeout_ms, timer_cb, call_times);
			}

			void stopTimer(TimerId timer_id)
			{
				timer_heap_.removeTimer(timer_id);
			}

		protected:
			void checkTimeout(const Timestamp &now)
			{
				timer_heap_.checkTimeout(now);
			}

		protected:
			bool quit_;
			TimerHeap timer_heap_;
		};
	} // namespace net
} // namespace zbluenet
#endif // ZBLUENET_NET_IO_SERVICE_H
