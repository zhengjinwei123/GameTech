TARGET = build/libzbluenet

SRCS = \
src/zbluenet/timestamp.cc \
src/zbluenet/semaphore.cc \
src/zbluenet/thread.cc \
src/zbluenet/timer_heap.cc \
src/zbluenet/dynamic_buffer.cc \
src/zbluenet/log.cc \
src/zbluenet/logger.cc \
src/zbluenet/logger_async_sink.cc \
src/zbluenet/logger_base.cc \
src/zbluenet/logger_file_sink.cc \
src/zbluenet/logger_mgr.cc \
src/zbluenet/logger_stderr_sink.cc \

LINK_TYPE = static
INCLUDE = -Isrc
CPP_FLAG = -DZBLUENET_BUILD_ENABLE_BASE_LOG
BUILD_DIR = build

include mak/main.mak