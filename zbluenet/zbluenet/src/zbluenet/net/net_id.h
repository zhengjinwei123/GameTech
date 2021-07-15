#ifndef ZBLUENET_NET_NET_ID_H
#define ZBLUENET_NET_NET_ID_H

#include <stdint.h>
#include <cstddef>

#include <zbluenet/net/platform.h>

namespace zbluenet {
	namespace net {
		class NetId {
		public:
			struct Hash {
				SOCKET operator()(const NetId &net_id) const;
			};

			NetId();
			void reset();

			NetId& operator=(const NetId &other);
			bool operator==(const NetId &other) const;
			bool isInvalid() const;

		public:
			int reactor_id;
			SOCKET socket_id;
		};

	} // namespace net
} // namespace zblue


#endif // ZBLUENET_NET_NET_ID_H
