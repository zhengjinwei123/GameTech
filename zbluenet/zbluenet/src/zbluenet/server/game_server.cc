#include <zbluenet/server/game_server.h>

#include <zbluenet/exchange/base_struct.h>
#include <zbluenet/protocol/net_protocol.h>
#include <zbluenet/net/net_thread.h>

namespace zbluenet {

	using protocol::NetProtocol;

	namespace server {

		GameServer::GameServer() :
			Server(),
			net_protocol_(40960, std::bind(&GameServer::createMessageMap, this, std::placeholders::_1))
		{
			
		}

		GameServer::~GameServer()
		{

		}

		// 获取消息，解码
		void GameServer::onRecvMessage(NetThread *pthread, TcpSocket::SocketId socket_id,
			DynamicBuffer *buffer, const NewNetCommandCallback &new_net_cmd)
		{
			for (;;) {
				int message_id = 0;
				std::unique_ptr<zbluenet::exchange::BaseStruct> message;
				NetProtocol::RetCode::type ret =
					net_protocol_.recvMessage(buffer, &message_id, message);
				if (NetProtocol::RetCode::WAITING_MORE_DATA == ret) {
					return;
				} else if (NetProtocol::RetCode::ERR == ret) {
					pthread->closeSocket(socket_id);
					return;
				} else if (NetProtocol::RetCode::MESSAGE_READY == ret) {
					std::unique_ptr<NetCommand> cmd(new NetCommand(NetCommand::Type::MESSAGE));
					cmd->id.reactor_id = pthread->getId();
					cmd->id.socket_id = socket_id;
					cmd->message = message.release();
					new_net_cmd(cmd);
				}
			}
		}

		// 发送消息， window 上需要一个循环一直处理，linux 上直接绑定event loop
		void GameServer::pushNetCommand(std::unique_ptr<NetCommand> &cmd)
		{

		}

		// 创建消息映射
		zbluenet::exchange::BaseStruct *GameServer::createMessageMap(int id)
		{

		}
	} // namespace server
} // namespace zbluenet