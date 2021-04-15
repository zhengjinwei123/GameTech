"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginHandler = void 0;
const c2s_proto_1 = require("../protos/c2s_proto");
const protobufManager_1 = require("../protobufManager");
const tankServer_1 = require("../tankServer");
const validUser = {
    "zjw111": "123456",
    "zjw222": "123456",
    "zjw333": "123456"
};
class LoginHandler {
    on$$C2S_Login_Request(message, client) {
        console.log("LoginHandler:C2S_Login_Request", message);
        if (!validUser[message.account]) {
            return c2s_proto_1.encodeRET.ACCOUNT_NOT_EXISTS;
        }
        if (validUser[message.account] !== message.password) {
            return c2s_proto_1.encodeRET.PASSWORD_ERROR;
        }
        // 设置玩家就绪
        client.setReady();
        tankServer_1.TankServer.getInstance().onClientReady(client.getClientId());
        let msg = {};
        msg.ret = c2s_proto_1.encodeRET.OK;
        msg.msgid = "ID_S2C_LOGIN_RESPONSE" /* ID_S2C_LOGIN_RESPONSE */;
        msg.timestamp = Math.floor(Date.now() / 1000); // 当前时间戳
        msg.frameInterval = 66; // 帧间隔
        msg.clientId = client.getClientId();
        protobufManager_1.ProtoBufManager.getInstance().postClientDirectMessage(client, msg);
        // 广播给其他玩家
        let enterMsg = {};
        enterMsg.clientId = client.getClientId();
        msg.ret = c2s_proto_1.encodeRET.OK;
        msg.msgid = "ID_S2C_PLAYER_ENTER_RESPONSE" /* ID_S2C_PLAYER_ENTER_RESPONSE */;
        tankServer_1.TankServer.getInstance().broadcastMsg(client.getClientId(), msg);
    }
}
exports.LoginHandler = LoginHandler;
