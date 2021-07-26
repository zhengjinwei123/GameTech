#ifndef ZBLEUNET_SERVER_SERVER_H
#define ZBLEUNET_SERVER_SERVER_H

#include  <zbluenet/net/tcp_socket.h>
#include <zbluenet/log.h>
#include <zbluenet/class_util.h>
#include <zbluenet/server/tcp_service>

#include <memory>
#include <string>

namespace zbluenet {

	class DynamicBuffer;

	namespace net {
		class NetThread;
		class TcpSocket;
	}

	namespace protocol {
		class NetCommand;
	}

	namespace exchange {
		class BaseStruct;
	}

	using net::NetThread;
	using net::TcpSocket;
	using protocol::NetCommand;

	namespace server {

		class Server : public Noncopyable {
		public:
			using NewNetCommandCallback = std::function<void(std::unique_ptr<NetCommand> &)>;

			Server();
			virtual ~Server();

			bool initMainLogger(const std::string &main_log_filename,
				zbluenet::LogLevel::type log_loglevel, bool open_console_log = false);
			bool initNetLogger(const std::string &net_log_filename,
				zbluenet::LogLevel::type log_level, bool open_console_log = false);

			bool start(const std::string &host, uint16_t port, int reactor_num = 2);

		protected:
			virtual void onRecvMessage(NetThread *pthread,
				TcpSocket::SocketId socket_id, DynamicBuffer *buffer,
				const NewNetCommandCallback &new_net_cmd) 
			{

			}
			void pushNetCommand(std::unique_ptr<NetCommand> &cmd);
			virtual zbluenet::exchange::BaseStruct *createMessageMap(int id) {}

		private:
			bool initLogger(const std::string &file_path_name,
				bool open_console_log,
				zbluenet::LogLevel::type log_level,
				zbluenet::LogManager::LoggerType::type logger_type);

		private:
			bool main_log_inited_;
			bool net_log_inited_;
		};

	} // namespace server
} // namespace zbluenet

#endif // ZBLEUNET_SERVER_SERVER_H
