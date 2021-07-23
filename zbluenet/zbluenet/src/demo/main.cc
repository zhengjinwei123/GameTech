#include <iostream>
#include <zbluenet/timestamp.h>
#include <zbluenet/semaphore.h>
#include <zbluenet/thread.h>
#include <zbluenet/timer_heap.h>
#include <zbluenet/type_define.h>
#include <zbluenet/log.h>
#include <zbluenet/net/network.h>

#include "server_app.hpp"

#include "thread.hpp"
#include <memory>
#include <string>
#include <cstdio>
using namespace std;


int main(int argc, char *argv[])
{
	//zbluenet::Timestamp now;

	//cout << now.getSecond() << "|" << now.getMillisecond() << endl;

	//std::unique_ptr<ThreadTester> threadTest(new ThreadTester());
	//threadTest->test();

	//zbluenet::TimerHeap timerHeap;
	//timerHeap.addTimer(now, 100, [](zbluenet_type::TimerId id)->void {
	//	//cout << "timerid:" << id << endl;
	//});

	//timerHeap.addTimer(now, 10, [](zbluenet_type::TimerId id)->void {
	//	//cout << "timerid2222:::::" << id << endl;
	//});

	std::unique_ptr<ServerApp> serverApp(new ServerApp());
	serverApp->start();

	//

	//while (true) {
	//	now.setNow();
	//	timerHeap.checkTimeout(now);

	//	/*	LOG_MESSAGE("zjw net msg");
	//		BASE_DEBUG("zjw base");

	//		PLAIN_LOG_DEBUG("zjw called");
	//		PLAIN_LOG_DEBUG("zjw called2222");
	//		LOG_DEBUG("zblue zjw");

	//		LOG_INFO("zjw info");
	//		LOG_WARNING("zjw warn");
	//		LOG_ERROR("zjw error");*/

	//	//LOG_PLAIN_BY_ID(1, "action log");
	//}

	


	return 0;
}