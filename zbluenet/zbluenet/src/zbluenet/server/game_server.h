#ifndef ZBLEUNET_SERVER_GAME_SERVER_H
#define ZBLEUNET_SERVER_GAME_SERVER_H

#include <zbluenet/server/server.h>
#include <zbluenet/protocol/net_protocol.h>

namespace zbluenet {
	namespace server {

		class GameServer : public Server {
		public:
			GameServer();
			virtual ~GameServer();

			virtual void onRecvMessage(NetThread *pthread,
				TcpSocket::SocketId socket_id,
				DynamicBuffer *buffer,
				const NewNetCommandCallback &new_net_cmd);
			void pushNetCommand(std::unique_ptr<NetCommand> &cmd);
			virtual zbluenet::exchange::BaseStruct *createMessageMap(int id);

		private:
			protocol::NetProtocol net_protocol_;
		};
	} // namespace server
} // namespace zbluenet
#endif // ZBLEUNET_SERVER_GAME_SERVER_H
