import { EventEmitter } from "events";

import { message } from 'antd';
import {
    encodeMSGID,
    encodeC2S_Login_Request,
    encodeC2S_FrameSync_Request,

    decodeS2C_PlayerEnter_Response,
    decodeS2C_Login_Response,
    decodeS2C_PlayerLeave_Response,
    decodeS2C_Ask_Response,
    decodeS2C_FrameSync_Response,
    encodeRET
} from "./net/c2s_proto.js"

export default class Socket extends EventEmitter {

    constructor(url) {
        super()

        this.url = url;
        this.socket = '';
   
        this.frameInterval = 0;
        this.frameBuffer = [];
        this.init();
    }
    init() {
        //判断当前浏览器支持不支持WebSocket
        if ('WebSocket' in window) {
            this.socket = new WebSocket(this.url);
        } else {
            // alertTip("该浏览器不支持WebSocket，请切换浏览器或升级后再试");
            return;
        }
    }

    // 一秒推送 15次 操作到服务器端， 不管玩家操作多快， 一帧只推送最后一次的操作
    startFrameLoop(frameInterval) {

        this.frameInterval = frameInterval

        setInterval(() => {
            if (this.frameBuffer && this.frameBuffer.length) {
                const data = {
                    "op": this.frameBuffer[this.frameBuffer.length - 1]
                }
                this.frameBuffer = [];
                this.sendMessage(data, encodeMSGID.ID_C2S_FRAMESYNC_REQUEST, encodeC2S_FrameSync_Request)
            }
        }, this.frameInterval)
    }

    onopen(callback) {
        this.socket.onopen = () => {
            // alert(1)

            console.log('链接成功！')
            if (callback) {
                callback()
            }
        }
    }
    onclose(callback) {
        this.socket.onclose = () => {
            // alert(2)
            console.log('链接断开！')
            if (callback) {
                callback()
            }
                
        }
    }

    sendMessage(payload, encodeMsgId, encoder) {
        let buffer = encoder(payload)
        let message = {
            length: buffer.length,
            msgtype: encodeMsgId,
            msg: Buffer.from(buffer)
        }

        let buf = Buffer.alloc(message.length + 8)
        buf.writeInt32LE(message.length + 8, 0)
        buf.writeInt32LE(message.msgtype, 4)
        message.msg.copy(buf, 8, 0, message.length)

        this.socket.send(buf)
    }

    // 登录
    sendLogin(username, password) {
        let data = {
            "account": username,
            "password": password,
        };
        this.sendMessage(data, encodeMSGID.ID_C2S_LOGIN_REQUEST, encodeC2S_Login_Request)
    }

    // 操作帧
    sendFrameSyncOp(opCode) {
        this.frameBuffer.push(opCode)
    }

    onAskResponse(data) {
        switch(data.errorcode) {
            case encodeRET.ACCOUNT_NOT_EXISTS:
                message.error('账号不存在');
                break
            case encodeRET.PASSWORD_ERROR:
                message.error('密码错误');
                break;
            case encodeRET.USER_HAS_LOGIN:
                message.error('此账号已经在其他地方登录了');
                break
            default:
                break
        }
        this.emit("ask_response", data)
    }

    messsageHandler(msgid, payload) {
        switch(msgid) {
            case encodeMSGID.ID_S2C_ASK_RESPONSE:
                this.onAskResponse(decodeS2C_Ask_Response(payload))
                break
            case encodeMSGID.ID_S2C_LOGIN_RESPONSE:
                this.emit("login_response", decodeS2C_Login_Response(payload))
                break
            case encodeMSGID.ID_S2C_PLAYER_ENTER_RESPONSE:
                this.emit("player_enter_response", decodeS2C_PlayerEnter_Response(payload))
                break
            case encodeMSGID.ID_S2C_PLAYER_LEAVE_RESPONSE:
                this.emit("player_leave_response", decodeS2C_PlayerLeave_Response(payload))
                break
            case encodeMSGID.ID_S2C_FRAMESYNC_RESPONSE:
                this.emit("frame_sync", decodeS2C_FrameSync_Response(payload))
                break;
            default:
                console.error("unhandle msg:", msgid)
        }
    }

    onmessage() {
        this.socket.onmessage = (data) => {
            if (data.data) {
                let reader = new FileReader()
                reader.readAsArrayBuffer(data.data)
                reader.onload = (e) => {
                    let blob = new Uint8Array(reader.result)
                    let buf = Buffer.from(blob)

                    let len = buf.readInt32LE(0)
                    let msgId = buf.readInt32LE(4)
                    let payload = Buffer.alloc(len)
                    buf.copy(payload, 0, 8, len+8)
                
                    this.messsageHandler(msgId, payload)
                }
            }
        }
    }
    send(option) {
        this.socket.send(option);
    }
    close() {
        this.socket.close();
    }
}