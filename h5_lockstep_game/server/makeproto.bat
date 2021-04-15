@echo off

call pbjs protobuf/c2s.proto --ts src/myserver/protos/c2s_proto.ts

@pause