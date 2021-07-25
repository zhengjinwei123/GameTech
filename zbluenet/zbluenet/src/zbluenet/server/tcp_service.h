#ifndef ZBLUENET_SERVER_TCP_SERVICE_H
#define ZBLUENET_SERVER_TCP_SERVICE_H

#include <string>
#include <stdint.h>
#include <functional>
#include <vector>
#include <unordered_map>

#include <zbluenet/net/socket_address.h>
#include <zbluenet/net/tcp_socket.h>
#include <zbluenet/net/acceptor.h>
#include <zbluenet/net/reactor.h>
#include <zbluenet/net/tcp_connection.h>


namespace zbluenet {

	class DynamicBuffer;

	namespace exchange {
		class BaseStruct;
	}

	namespace net {
		class NetThread;
		class IOService;
		class NetId;
	}

	namespace protocol {
		class NetCommand;
	}

	using net::SocketAddress;
	using net::TcpSocket;
	using net::Acceptor;
	using net::Reactor;
	using net::TcpConnection;
	using net::NetThread;
	using protocol::NetCommand;
	using net::IOService;
	using net::NetId;

	namespace server {

		class TcpService : public IOService {
		public:
			struct ConnectionInfo {
				time_t last_request_second;
				int requst_per_second;
			};
		public:
			using NetThreadVector = std::vector<NetThread *>;
			using CreateMessageFunc = std::function<zbluenet::exchange::BaseStruct *(int)>;
			using RecvMessageCallback = std::function< void(NetThread *, TcpSocket::SocketId, DynamicBuffer *)>;
			using ConnectionInfoMap = std::unordered_map<NetId, ConnectionInfo, NetId::Hash>;
			using MessageHandler = std::function<void(const NetId &, const zbluenet::exchange::BaseStruct *)>;
			using MessageHandlerMap = std::unordered_map<int, MessageHandler>;
			using NewNetCommandCallback = std::function<void(std::unique_ptr<NetCommand> &)>;
		

		public:
			TcpService(const std::string &host, uint16_t port, uint8_t reactor_num);
			virtual ~TcpService();

			bool createService(const RecvMessageCallback &recv_message_cb, uint16_t max_clien_num);
			bool init(const NewNetCommandCallback &new_net_cmd_cb, 
				const CreateMessageFunc &create_messgae_func, int max_request_per_second = 0);
			void start();
			void stop();
			
			void disconnect(const NetId &net_id);
			void sendMessage(const NetId &net_id, int message_id,
				std::unique_ptr<zbluenet::exchange::BaseStruct> &message);
			void enableBroadcast(const NetId &net_id);
			void disableBroadcast(const NetId &net_id);
			void broadcastMessage(int message_id, std::unique_ptr<zbluenet::exchange::BaseStruct> &message);

			virtual void onConnect(const NetId &net_id);
			virtual void onDisconnect(const NetId &net_id);
			virtual void onExceedRequestFrequencyLimit(const NetId &net_id) {}

			MessageHandler getMessageHandler(int message_id) const;
			void setMessageHandler(int message_id, const MessageHandler &message_handler);

		private:
			void push(std::unique_ptr<NetCommand> &cmd);
			void loop();
			void onNewConnCallback(std::unique_ptr<TcpSocket> &peer_socket);

			void onMessage(const NetId &net_id, int message_id, const zbluenet::exchange::BaseStruct *message);
			bool checkRequestFrequencyLimit(ConnectionInfo &info);

		private:
			SocketAddress listen_addr_;
			TcpSocket listen_socket_;
			uint8_t net_thread_num_; // 反应器线程数量
			Acceptor *net_acceptor_;
			int max_connection_num_;
			NetThreadVector net_threads_;

			RecvMessageCallback recv_message_cb_;
			CreateMessageFunc create_message_func_;
			ConnectionInfoMap connection_infos_;
			MessageHandlerMap message_handlers_;
			int max_request_per_second_;
		};
	} // namespace server
} // namespace zbluenet
#endif // ZBLUENET_SERVER_TCP_SERVICE_H
