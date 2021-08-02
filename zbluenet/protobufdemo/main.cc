#include <cstdio>
#include <string>
#include "./protocol/test.pb.h"

//#define PROTOBUF_USE_DLLS

int main(int argc, char *argv[])
{
	Login login;
	login.set_account("zjw");
	login.set_age(128);
	
	login.add_friends(1);
	login.add_friends(2);
	login.add_friends(3);

	std::string str = login.SerializeAsString();

	Login login2;
	if (login2.ParseFromString(str)) {
		printf("%s | %d  \n", login2.account().c_str(), login2.age());

		for (int i = 0 ; i < login2.friends_size(); ++i) {
			printf(" friend(%d)=%d \r\n", i, login2.friends(i));
		}
	}

	system("pause");


	return 0;
}