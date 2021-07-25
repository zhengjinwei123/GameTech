#include <zbluenet/server/tcp_service.h>
#include <zbluenet/net/net_thread.h>
#include <zbluenet/net/tcp_socket.h>
#include <zbluenet/dynamic_buffer.h>
#include <zbluenet/protocol/net_command.h>
#include <zbluenet/exchange/base_struct.h>
#include <zbluenet/protocol/net_protocol.h>

#include <memory>


class ServerApp {
public:
	ServerApp()
	{

	}
	~ServerApp()
	{

	}

	// 收到消息， 解析消息
	void onRecvMessage(zbluenet::net::NetThread *pthread,
		zbluenet::net::TcpSocket::SocketId socket_id, zbluenet::DynamicBuffer *buffer)
	{
		for (;;) {
			int message_id = 0;
			std::unique_ptr<zbluenet::exchange::BaseStruct> message;
			zbluenet::protocol::NetProtocol::RetCode::type ret = ;

		}
	}

	// 发送消息
	void pushNetCommand(std::unique_ptr<zbluenet::protocol::NetCommand> &cmd)
	{

	}

	// 创建消息映射
	zbluenet::exchange::BaseStruct * create(int id)
	{
		return nullptr;
	}

	void start()
	{
		// 初始化logger
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

		std::unique_ptr<zbluenet::server::TcpService> gameServer(new zbluenet::server::TcpService("127.0.0.1", 9090, 4));
		if (false == gameServer->createService(
			std::bind(&ServerApp::onRecvMessage, this, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3),
			3000)) 
		{
			return;
		}

		if (false == gameServer->init(
			std::bind(&ServerApp::pushNetCommand, this, std::placeholders::_1),
			std::bind(&ServerApp::create, this, std::placeholders::_1),
			0)) {
			return;
		}

		gameServer->start();
	}
};