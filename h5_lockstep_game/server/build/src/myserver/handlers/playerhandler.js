"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerHandler = void 0;
const c2s_proto_1 = require("../protos/c2s_proto");
const protobufManager_1 = require("../protobufManager");
const tankServer_1 = require("../tankServer");
const validUser = {
    "a": { password: "a", uid: 1 },
    "b": { password: "b", uid: 2 },
    "c": { password: "c", uid: 3 },
    "d": { password: "d", uid: 4 },
    "e": { password: "e", uid: 5 },
    "f": { password: "f", uid: 6 },
    "g": { password: "g", uid: 7 },
};
class PlayerHandler {
    on$$C2S_Login_Request(message, client) {
        console.log("LoginHandler:C2S_Login_Request", message);
        if (!validUser[message.account]) {
            return c2s_proto_1.encodeRET.ACCOUNT_NOT_EXISTS;
        }
        if (validUser[message.account].password !== message.password) {
            return c2s_proto_1.encodeRET.PASSWORD_ERROR;
        }
        if (tankServer_1.TankServer.getInstance().checkUserHasLogin(validUser[message.account].uid)) {
            return c2s_proto_1.encodeRET.USER_HAS_LOGIN;
        }
        // 设置玩家就绪
        client.setReady(validUser[message.account].uid);
        tankServer_1.TankServer.getInstance().onClientReady(client.getUid());
        let msg = {};
        msg.ret = c2s_proto_1.encodeRET.OK;
        msg.msgid = "ID_S2C_LOGIN_RESPONSE" /* ID_S2C_LOGIN_RESPONSE */;
        msg.timestamp = Math.floor(Date.now() / 1000); // 当前时间戳
        msg.frameInterval = 66; // 帧间隔
        msg.clientId = client.getUid(); // 玩家id
        msg.clients = tankServer_1.TankServer.getInstance().getUidList(client.getUid()); // 其他玩家
        msg.frames = tankServer_1.TankServer.getInstance().getStepHistory(); // 历史帧， 客户端需要追帧
        protobufManager_1.ProtoBufManager.getInstance().postClientDirectMessage(client, msg);
        // 把进入的玩家广播给其他玩家
        let enterMsg = {};
        enterMsg.clientId = client.getUid();
        enterMsg.ret = c2s_proto_1.encodeRET.OK;
        enterMsg.msgid = "ID_S2C_PLAYER_ENTER_RESPONSE" /* ID_S2C_PLAYER_ENTER_RESPONSE */;
        tankServer_1.TankServer.getInstance().broadcastMsg(client.getUid(), enterMsg);
    }
}
exports.PlayerHandler = PlayerHandler;
