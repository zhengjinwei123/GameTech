#include <zbluenet/server/server.h>
#include <zbluenet/logger_base.h>
#include <zbluenet/server/tcp_service.h>

#include <functional>

namespace zbluenet {
	namespace server {

		Server::Server():
			main_log_inited_(false),
			net_log_inited_(false)
		{

		}

		Server::~Server()
		{

		}

		void Server::pushNetCommand(std::unique_ptr<NetCommand> &cmd)
		{

		}

		// 启动服务
		bool Server::start(const std::string &host, uint16_t port, int reactor_num)
		{
			if (!main_log_inited_) {
				::fprintf(stderr, "main log not init");
				return false;
			}
			if (!net_log_inited_) {
				::fprintf(stderr, "net log not init");
				return false;
			}

			std::unique_ptr<zbluenet::server::TcpService> tcpService(new TcpService(host, port, reactor_num));
			if (false == tcpService->createService(std::bind(&Server::onRecvMessage, this, std::placeholders::_1,
				std::placeholders::_2, std::placeholders::_3, std::placeholders::_4), 50000)) {
				fprintf(stderr, "create tcp service fail");
				return false;
			}

			if (false == tcpService->init(
				std::bind(&Server::pushNetCommand, this, std::placeholders::_1),
				std::bind(&Server::createMessageMap, this, std::placeholders::_1))
			) {
				fprintf(stderr, "init tcp service fail");
				return false;
			}

			tcpService->start();

			return true;
		}

		// 初始化主日志
		bool Server::initMainLogger(const std::string &main_log_filename,
			zbluenet::LogLevel::type log_level, bool open_console_log)
		{
			return initLogger(main_log_filename,
				open_console_log, log_level, zbluenet::LogManager::LoggerType::MAIN);
		}

		// 初始化网络日志
		bool Server::initNetLogger(const std::string &net_log_filename,
			zbluenet::LogLevel::type log_level, bool open_console_log)
		{
			return initLogger(net_log_filename,
				open_console_log, log_level, zbluenet::LogManager::LoggerType::NET);
		}

		// private method
		bool Server::initLogger(const std::string &file_path_name,
			bool open_console_log,
			zbluenet::LogLevel::type log_level,
			zbluenet::LogManager::LoggerType::type logger_type)
		{
			return zbluenet::LogManager::getInstance()->initLogger(file_path_name,
				open_console_log, log_level, logger_type);
		}

	} // namespace server
} // namespace zbluenet