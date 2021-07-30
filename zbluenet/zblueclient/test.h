#ifndef TEST_H
#define TEST_H

class Test {
private:
	Test(){}

public:
	~Test() {}

	static Test *getInstance()
	{
		if (inst == NULL) {
			inst = new Test();
		}
		return inst;
	}

private:
	static  Test* inst;
};

Test* Test::inst = nullptr;




#endif
