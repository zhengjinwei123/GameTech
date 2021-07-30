#include "c2s_message.h"

#include <zbluenet/exchange/macro.h>
#include <sstream>

C2SLoginRequest::C2SLoginRequest()
{

}

C2SLoginRequest::~C2SLoginRequest()
{

}

void C2SLoginRequest::swap(C2SLoginRequest &other)
{
	this->account.swap(other.account);
	this->token.swap(other.account);
	std::swap(this->age, other.age);
}

int C2SLoginRequest::encode(char *buffer, size_t size) const
{
	char *p = buffer;
	size_t left_bytes = size;

	WRITE_STRING(this->account);
	WRITE_STRING(this->token);
	WRITE_INT32V(this->age);

	return size - left_bytes;
}

int C2SLoginRequest::decode(const char *buffer, size_t size)
{
	const char *p = buffer;
	size_t left_bytes = size;

	READ_STRING(this->account);
	READ_STRING(this->token);
	READ_INT32V(this->age);

	return size - left_bytes;
}

std::string C2SLoginRequest::dump() const
{
	std::stringstream ss;

	ss << "account: \"" << this->account << "\" ";
	ss << "token: \"" << this->token << "\" ";
	ss << "age:" << this->age << " ";

	std::string s = ss.str();
	if (s.empty() == false) {
		s.erase(s.end() - 1);
	}

	return s;
}

