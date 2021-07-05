#ifndef WINDOWS_TCP_SERVER_HPP
#define WINDOWS_TCP_SERVER_HPP

#include <zbluenet/net/network.h>
#include <zbluenet/net/socket_address.h>

#include <iostream>
using namespace std;

class WindowsTcpServer {
public:
	WindowsTcpServer()
	{
		
	}
	~WindowsTcpServer()
	{

	}

	int CreateServer(const zbluenet::net::SocketAddress &addr) {
		zbluenet::net::NetWork::Init();

		SOCKET server_socket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
		if (INVALID_SOCKET == server_socket) {
			count << "create socket error" << endl;
			return -1;
		}


	}

};

#endif