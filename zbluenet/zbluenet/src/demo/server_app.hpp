#include <zbluenet/server/tcp_service.h>
#include <zbluenet/net/net_thread.h>
#include <zbluenet/net/tcp_socket.h>
#include <zbluenet/dynamic_buffer.h>

#include <memory>


class ServerApp {
public:
	ServerApp()
	{

	}
	~ServerApp()
	{

	}

	void onRecvMessage(zbluenet::net::NetThread *pthread, zbluenet::net::TcpSocket::SocketId socket_id, zbluenet::DynamicBuffer *buffer)
	{

	}

	void start()
	{
		// ³õÊ¼»¯logger
		zbluenet::LogManager::getInstance()->setMaxLoggerCount(2);

		std::string log_file_main = "./zbluenet.%Y%m%d.log";
		if (zbluenet::LogManager::getInstance()->initLogger(log_file_main, true, zbluenet::LogLevel::DEBUG, zbluenet::LogManager::LoggerType::MAIN) == false) {
			::fprintf(stderr, "init main log failed \n");
			return;
		}

		std::string log_file_action = "./net.%Y%m%d.log";
		if (zbluenet::LogManager::getInstance()->initLogger(log_file_action, true, zbluenet::LogLevel::DEBUG, zbluenet::LogManager::LoggerType::NET) == false) {
			::fprintf(stderr, "init action log failed \n");
			return;
		}

		std::unique_ptr<zbluenet::server::TcpService> myserver(new zbluenet::server::TcpService("127.0.0.1", 9090, 4));
		if (false == myserver->createService(
			std::bind(&ServerApp::onRecvMessage, this, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3),
			3000)) 
		{
			return;
		}

		if (false == myserver->start()) {
			return;
		}
	}
};