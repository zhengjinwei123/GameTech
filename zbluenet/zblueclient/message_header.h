#ifndef MESSAGE_HEADER_H
#define MESSAGE_HEADER_H

#include <stdint.h>

struct messageId {
	enum type {
		C2S_LOGIN_REQUEST = 1001,
		S2C_LOGIN_RESPONSE = 1002,

		CMD_UNKOWN = 20000
	};
};


struct MessageHeader {
	MessageHeader()
	{
		data_length = sizeof(MessageHeader);
		message_id = messageId::CMD_UNKOWN;
	}

	uint16_t message_id;
	uint16_t data_length;
};

struct MessageLogin : public MessageHeader {
	MessageLogin()
	{
		message_id = messageId::C2S_LOGIN_REQUEST;
		data_length = sizeof(MessageLogin);
	}

	char username[32];
	char password[32];
};


#endif // MESSAGE_HEADER_H
