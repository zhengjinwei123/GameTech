"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TankClient = void 0;
const clientbase_1 = __importDefault(require("../libs/net/ws/clientbase"));
const consts_1 = require("./protos/consts");
class TankClient extends clientbase_1.default {
    constructor(socket) {
        super(socket);
        this._clientId = -1;
        this._uid = -1;
        this._status = consts_1.PLAYER_STATUS.CONNECTED; // 设置已连接
    }
    getUid() {
        return this._uid;
    }
    setReady(uid) {
        this._status = consts_1.PLAYER_STATUS.READY;
        this._uid = uid;
    }
    isReady() {
        return this._status == consts_1.PLAYER_STATUS.READY;
    }
    getClientId() {
        return this._clientId;
    }
    setClientId(clientId) {
        this._clientId = clientId;
    }
    setActive() {
        this._lastActiveTimestamp = Date.now();
    }
    send(message) {
        super.send(message);
        let buf = Buffer.alloc(message.length + 8);
        buf.writeInt32LE(message.length + 8, 0);
        buf.writeInt32LE(message.msgtype, 4);
        message.msg.copy(buf, 8, 0, message.length);
        this._socket.send(buf);
    }
    onError(err) {
        this.emit("error", err);
    }
    onMessage(message) {
        this.setActive();
        this.emit("msg", message);
    }
    onSchedule() {
        this.emit("schedule");
    }
    onEnd() {
        this.emit("end");
    }
}
exports.TankClient = TankClient;
