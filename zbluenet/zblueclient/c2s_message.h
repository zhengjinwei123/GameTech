#ifndef CS2_MESSAGE_H
#define CS2_MESSAGE_H

#include <stdint.h>
#include <cstddef>
#include <string>

#include "base_struct.h"

class C2SLoginRequest : public zbluenet::exchange::BaseStruct {
public:
	C2SLoginRequest();
	~C2SLoginRequest();

	void swap(C2SLoginRequest &other);
	static zbluenet::exchange::BaseStruct *create() { return new C2SLoginRequest();  }
	virtual int encode(char *buffer, size_t size) const;
	virtual int decode(const char *buffer, size_t size);
	virtual C2SLoginRequest *clone() const { return new C2SLoginRequest(*this);  }

	virtual std::string dump() const;

public:
	std::string account;
	std::string token;
	int32_t age;
};



#endif
