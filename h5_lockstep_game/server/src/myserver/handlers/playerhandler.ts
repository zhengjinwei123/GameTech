import {TankClient} from "../tankClient"

import {C2S_Login_Request, S2C_Login_Response, encodeRET, MSGID, S2C_PlayerEnter_Response} from "../protos/c2s_proto"
import { ProtoBufManager } from "../protobufManager"
import { TankServer } from "../tankServer"


const validUser = {
    "a": {password: "a", uid: 1},
    "b": {password: "b", uid: 2},
    "c": {password: "c", uid: 3},
    "d": {password: "d", uid: 4},
    "e": {password: "e", uid: 5},
    "f": {password: "f", uid: 6},
    "g": {password: "g", uid: 7},

}
export class PlayerHandler {
    public on$$C2S_Login_Request(message: C2S_Login_Request, client: TankClient) {
        console.log("LoginHandler:C2S_Login_Request", message)

        if (!validUser[message.account]) {
            return encodeRET.ACCOUNT_NOT_EXISTS;
        }
        if (validUser[message.account].password !== message.password) {
            return encodeRET.PASSWORD_ERROR;
        }

        if (TankServer.getInstance().checkUserHasLogin(validUser[message.account].uid)) {
            return encodeRET.USER_HAS_LOGIN;
        }

        // 设置玩家就绪
        client.setReady(validUser[message.account].uid);
        TankServer.getInstance().onClientReady(client.getUid())

        let msg = <S2C_Login_Response>{}
        msg.ret = encodeRET.OK;
        msg.msgid = MSGID.ID_S2C_LOGIN_RESPONSE
        msg.timestamp = Math.floor(Date.now() / 1000); // 当前时间戳
        msg.frameInterval = 66; // 帧间隔
        msg.clientId = client.getUid() // 玩家id
        msg.clients = TankServer.getInstance().getUidList(client.getUid()) // 其他玩家
        msg.frames = TankServer.getInstance().getStepHistory() // 历史帧， 客户端需要追帧

        ProtoBufManager.getInstance().postClientDirectMessage(client, msg)

        // 把进入的玩家广播给其他玩家
        let enterMsg = <S2C_PlayerEnter_Response>{}
        enterMsg.clientId = client.getUid()
        enterMsg.ret = encodeRET.OK;
        enterMsg.msgid = MSGID.ID_S2C_PLAYER_ENTER_RESPONSE;

        TankServer.getInstance().broadcastMsg(client.getUid(), enterMsg)
    }
}