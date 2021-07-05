TARGET = bin/demo
SRCS = \
src/demo/main.cc

LINK_TYPE = exec
INCLUDE = -Isrc
BUILD_DIR = build
DEPFILE = \
build/libzbluenet.a \

LIB = \
-Lbuild -lzbluenet \
-L/usr/lib64/mysql -lmysqlclient -lpthread -lrt \

include mak/main.mak