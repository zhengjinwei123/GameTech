"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncHandler = void 0;
const tankServer_1 = require("../tankServer");
class SyncHandler {
    // 玩家发来的帧
    on$$C2S_FrameSync_Request(message, client) {
        const op = message.op;
        // console.log("玩家发来的帧", message)
        tankServer_1.TankServer.getInstance().pushCommand(client.getClientId(), op);
    }
}
exports.SyncHandler = SyncHandler;
