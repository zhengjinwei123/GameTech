#ifndef ZBLUENET_NET_NETEVENT_H
#define ZBLUENET_NET_NETEVENT_H

namespace zbluenet {
	namespace net {

		class ReactorService;

		class NetEvent {
		public:
			virtual void onNetJoin() = 0;
			virtual void onNetLeave() = 0;
			virtual void onNetMessage(ReactorService *pService) = 0;
			virtual void onNetRecv() = 0;
			virtual void onNetRun(ReactorService *pService) = 0;
		};
	} // namespace net
} // namespace zbluenet

#endif // ZBLUENET_NET_NETEVENT_H
