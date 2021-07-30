#include "server_app.h"

#include <zbluenet/log.h>
#include <memory>
#include <functional>
#include "c2s_login_message_handler.h"

ServerApp *ServerApp::instance_ = nullptr;


ServerApp::ServerApp():pserver_(nullptr)
{

}

void ServerApp::onConnect(const zbluenet::net::NetId &net_id)
{
	LOG_DEBUG("on connect : %d | %lld", net_id.reactor_id, net_id.socket_id);
}

void ServerApp::onDisconnect(const zbluenet::net::NetId &net_id)
{
	LOG_DEBUG("on disconnect : %d | %lld", net_id.reactor_id, net_id.socket_id);
}

zbluenet::server::GameServer* ServerApp::getServer() {
	return pserver_;
}

void ServerApp::start()
{
	zbluenet::LogManager::getInstance()->setMaxLoggerCount(2);

	pserver_ = new zbluenet::server::GameServer("127.0.0.1", 9091, 2);
	std::string log_file_main = "./zbluenet.%Y%m%d.log";
	pserver_->initMainLogger(log_file_main, zbluenet::LogLevel::DEBUG, true);
	std::string log_file_net = "./net.%Y%m%d.log";
	pserver_->initNetLogger(log_file_net, zbluenet::LogLevel::DEBUG, true);

	// ×¢²áÏûÏ¢
	C2SLoginMessageHandler::bind();

	if (false == pserver_->start(
		std::bind(&ServerApp::onConnect, this, std::placeholders::_1),
		std::bind(&ServerApp::onDisconnect, this, std::placeholders::_1),
		nullptr
	)) {
		LOG_DEBUG("server start fail");
		return;
	}
}
