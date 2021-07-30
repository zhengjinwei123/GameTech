#include <stdio.h>
#include <string.h>
#include <WINSOCK2.H>
#include <stdbool.h>

#pragma comment(lib,"ws2_32.lib")

#define INT_SERVER_PORT 9091
#define STR_SERVER_IP "127.0.0.1"
#define INT_DATABUFFER_SIZE 100
#define  WINSOCK_VERSION MAKEWORD(2,0)
typedef struct sockaddr_in sockaddr_in;
typedef struct WSAData WSAData;
typedef struct sockaddr sockaddr;
void main(void)
{
	WORD dwVersion = MAKEWORD(2, 2);
	WSAData wsaData;
	WSAStartup(WINSOCK_VERSION, &wsaData);

	SOCKET sockServer = socket(AF_INET, SOCK_STREAM, 0);
	if (INVALID_SOCKET == sockServer)
	{
		printf("Failed to create socket!\r\n");
		WSACleanup();
		return;
	}

	sockaddr_in addrServer;
	memset(&addrServer, 0, sizeof(sockaddr_in));
	addrServer.sin_family = AF_INET;
	addrServer.sin_port = htons(INT_SERVER_PORT);
	addrServer.sin_addr.S_un.S_addr = htonl(INADDR_ANY);
	//addrServer.sin_addr.s_addr = htonl(INADDR_ANY);

	int iResult;

	bool bReuseAddr = true;
	iResult = setsockopt(sockServer, SOL_SOCKET, SO_REUSEADDR, (char *)&bReuseAddr, sizeof(bReuseAddr));
	if (SOCKET_ERROR == iResult)
	{
		printf("Failed to set resueaddr socket!\r\n");
		WSACleanup();
		return;
	}

	/*
	unsigned   long cmd = 1;
	iResult= ioctlsocket(sockServer,FIONBIO,&cmd); */

	iResult = bind(sockServer, (sockaddr *)&addrServer, sizeof(addrServer));
	if (SOCKET_ERROR == iResult)
	{
		printf("Failed to bind address!\r\n");
		WSACleanup();
		return;
	}

	if (0 != listen(sockServer, 5))
	{
		printf("Failed to listen client!\r\n");
		WSACleanup();
		return;
	}

	UINT i = 0;
	SOCKET sockAccept;
	sockaddr_in addrAccept;
	int iAcceptLen = sizeof(addrAccept);
	char szDataBuff[INT_DATABUFFER_SIZE];
	int iRecvSize;

	sockaddr_in addrTemp;
	int iTempLen;

	fd_set fd;
	FD_ZERO(&fd);
	FD_SET(sockServer, &fd);

	/*
	timeval tm;
	tm.tv_sec = 0;
	tm.tv_usec = 1000;
	*/
	printf("Start server...\r\n");
	while (1)
	{
		fd_set fdOld = fd;
		iResult = select(0, &fdOld, NULL, NULL,/*&tm*/NULL);
		if (0 <= iResult)
		{
			for (i = 0; i < fd.fd_count; i++)
			{
				if (FD_ISSET(fd.fd_array[i], &fdOld))
				{
					//如果socket是服务器，则接收连接
					if (fd.fd_array[i] == sockServer)
					{
						memset(&addrAccept, 0, sizeof(addrTemp));
						sockAccept = accept(sockServer, (sockaddr *)&addrAccept, &iAcceptLen);
						if (INVALID_SOCKET != sockAccept)
						{
							FD_SET(sockAccept, &fd);
							//FD_SET(sockAccept,&fdOld);
							printf("%s:%d has connected server!\r\n", inet_ntoa(addrAccept.sin_addr),
								ntohs(addrAccept.sin_port));
						}
					}
					else //非服务器,接收数据(因为fd是读数据集)
					{
						memset(szDataBuff, 0, INT_DATABUFFER_SIZE);
						iRecvSize = recv(fd.fd_array[i], szDataBuff, INT_DATABUFFER_SIZE, 0);
						memset(&addrTemp, 0, sizeof(addrTemp));
						iTempLen = sizeof(addrTemp);
						getpeername(fd.fd_array[i], (sockaddr *)&addrTemp, &iTempLen);

						if (SOCKET_ERROR == iRecvSize)
						{
							closesocket(fd.fd_array[i]);
							FD_CLR(fd.fd_array[i], &fd);
							i--;
							printf("Failed to recv data ,%s:%d errorcode:%d.\r\n",
								inet_ntoa(addrTemp.sin_addr), ntohs(addrTemp.sin_port), WSAGetLastError());
							continue;
						}

						if (0 == iRecvSize)
						{
							//客户socket关闭
							printf("%s:%d has closed!\r\n", inet_ntoa(addrTemp.sin_addr),
								ntohs(addrTemp.sin_port));

							closesocket(fd.fd_array[i]);
							FD_CLR(fd.fd_array[i], &fd);
							i--;
						}

						if (0 < iRecvSize)
						{
							//打印接收的数据
							printf("recv %s:%d data:%s\r\n", inet_ntoa(addrTemp.sin_addr),
								ntohs(addrTemp.sin_port), szDataBuff);
						}
					}
				}
			}
		}
		else if (SOCKET_ERROR == iResult)
		{
			//WSACleanup();	
		//	printf("Faild to select sockt in server!/r/n");
			Sleep(100);
		}
	}
	WSACleanup();
}