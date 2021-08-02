# GameTech
游戏技术

##### 帧同步H5 坦克大战游戏

1. 启动服务器
```
1. cd h5_lockstep_game/server
2. yarn install
3. yarn start
```

2. 启动客户端
```
1. cd h5_lockstep_game/client/tankclient
2. yarn install
3. yarn start
```

3. 注意事项
```
1. 用户名密码是写死的，支持以下多组账号密码
用户名  密码
a      a
b      b
c      c
d      d
e      e
f      f
g      g

2. 开启2 个以上客户端才能开始控制坦克进行游戏
```

4. 技术
``` c++
1. 乐观锁帧
2. websocket 协议通讯 (web端不支持UDP)
3. H5 Canvas
4. react 脚手架 create-react-app 创建应用
5. typescript 支持
6. protobuf 协议
7. 客户端逻辑帧和渲染帧分离
```
