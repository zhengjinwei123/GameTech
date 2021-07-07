#ifndef ZBLUENET_LOG_H
#define ZBLUENET_LOG_H

#include <zbluenet/class_util.h>
#include <zbluenet/logger_mgr.h>
#include <zbluenet/logger_base.h>

#include <string>


namespace zbluenet {

	struct LogLevel {
		enum type {
			MIN = 0,

			DEBUG = 0,
			INFO,
			WARNING,
			ERR,

			MAX,
		};
	};

	

	class LogManager {
	public:
		bool initLogger(const std::string &log_file_path, bool log_stderr, int level_filer, int logger_id = 0);
		void setMaxLoggerCount(int count);

	private:
		ZBLUENET_SINGLETON(LogManager);

		int logger_id_;
	};

	void logNetMessage(const char *fmt, ...);
} // namespace zbluenet


#define LOG_DEBUG(fmt, ...) \
	zbluenet::LoggerMgr::getInstance()->log(0, zbluenet::LogLevel::DEBUG, __FILE__, __LINE__, __func__, fmt, ##__VA_ARGS__)

#define LOG_INFO(fmt, ...) \
	zbluenet::LoggerMgr::getInstance()->log(0, zbluenet::LogLevel::INFO, __FILE__, __LINE__, __func__, fmt, ##__VA_ARGS__)

#define LOG_WARNING(fmt, ...) \
	zbluenet::LoggerMgr::getInstance()->log(0, zbluenet::LogLevel::WARNING, __FILE__, __LINE__, __func__, fmt, ##__VA_ARGS__)

#define LOG_ERROR(fmt, ...) \
	zbluenet::LoggerMgr::getInstance()->log(0, zbluenet::LogLevel::ERR, __FILE__, __LINE__, __func__, fmt, ##__VA_ARGS__)

#define PLAIN_LOG_DEBUG(fmt, ...) \
	zbluenet::LoggerMgr::getInstance()->plainLog(0,  zbluenet::LogLevel::DEBUG, fmt, ##__VA_ARGS__)

#define PLAIN_LOG_INFO(fmt, ...) \
	zbluenet::LoggerMgr::getInstance()->plainLog(0,  zbluenet::LogLevel::INFO, fmt, ##__VA_ARGS__)

#define PLAIN_LOG_WARNING(fmt, ...) \
	zbluenet::LoggerMgr::getInstance()->plainLog(0,  zbluenet::LogLevel::WARNING, fmt, ##__VA_ARGS__)

#define PLAIN_LOG_ERROR(fmt, ...) \
	zbluenet::LoggerMgr::getInstance()->plainLog(0,  zbluenet::LogLevel::ERR, fmt, ##__VA_ARGS__)

#define LOG_MESSAGE(fmt, ...) \
	zbluenet::logNetMessage(fmt, ##__VA_ARGS__)

#define LOG_PLAIN_BY_ID(id, fmt, ...) \
	zbluenet::LoggerMgr::getInstance()->plainLog(id,  zbluenet::LogLevel::DEBUG, fmt, ##__VA_ARGS__)

#endif // ZBLUENET_LOG_H 
