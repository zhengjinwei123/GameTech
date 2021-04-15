"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class WSClientBase extends events_1.EventEmitter {
    constructor(socket) {
        super();
        this._clientId = 0;
        this._socket = socket;
        this._buffer = null;
        this._lastActiveTimestamp = Date.now();
        this._lostHeartbeat = false;
        this._checkActiveIntervalId = setInterval(() => {
            let now = Date.now();
            if (now - this._lastActiveTimestamp > 1000 * 60 * 10) {
                // 超过10分钟没有收到消息
                this._lostHeartbeat = true;
            }
            else {
                this.onSchedule();
            }
        }, 1000 * 60); // 一分钟检查一次心跳包
    }
    initialize(clientId) {
        this._clientId = clientId;
        this._socket.on("binary", (inStream) => {
            if (this._buffer == null) {
                this._buffer = Buffer.alloc(0);
            }
            inStream.on("readable", () => {
                let newData = inStream.read();
                if (newData) {
                    this._buffer = Buffer.concat([this._buffer, newData], this._buffer.length + newData.length);
                }
            });
            inStream.on("end", () => {
                // console.log("received: " + this._buffer.length + " bytes of binary data")
                // head + body
                // head: len:4 + type:4
                let len = this._buffer.readInt32LE(0);
                if (len > 1024 * 1024 || len < 0) {
                    return;
                }
                let inMessage = {};
                inMessage.length = len;
                inMessage.msgtype = this._buffer.readInt32LE(4);
                if (len > 0) {
                    inMessage.msg = Buffer.alloc(len - 8);
                    this._buffer.copy(inMessage.msg, 0, 8, len);
                }
                this.onMessage(inMessage);
                if (this._buffer.length > len) {
                    this._buffer = this._buffer.slice(len);
                }
                else {
                    this._buffer = null;
                }
            });
        });
        this._socket.on("close", (code, reason) => {
            console.log("zjw connection closed", code, reason);
            this.onEnd();
        });
        this._socket.on("error", (err) => {
            this.onError(`error: ${err}`);
        });
        this._socket.on("text", (str) => {
        });
    }
    getClientId() {
        return this._clientId;
    }
    getSocket() {
        return this._socket;
    }
    close() {
        this._socket.close();
        clearInterval(this._checkActiveIntervalId);
    }
    setActive() {
        this._lastActiveTimestamp = Date.now();
    }
    send(message) {
        this.setActive();
    }
}
exports.default = WSClientBase;
