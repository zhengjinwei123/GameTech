#include <zbluenet/thread.h>
#include <cstdio>


class ThreadTester {

public:
	void test()
	{
		thread_.start(std::bind(&ThreadTester::onCreate, this, std::placeholders::_1),
			std::bind(&ThreadTester::onRun, this, std::placeholders::_1),
			std::bind(&ThreadTester::onDestroy, this, std::placeholders::_1));
	}

	void onCreate(zbluenet::Thread *pthread) {
		printf("thread on create \n");
	}

	void onRun(zbluenet::Thread *pthread) {
		printf("thread onRun \n");

		int i = 0;
		while (i < 10) {
			pthread->sleep(1000);
			//printf("thread onRun: %d\n", i);
			i++;
		}

	}

	void onDestroy(zbluenet::Thread *pthread) {
		printf("thread onDestroy \n");
	}

private:
	zbluenet::Thread thread_;
};