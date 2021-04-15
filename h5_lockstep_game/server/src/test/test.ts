let ws = require("ws")
import { C2S_Login_Request, MSGID, encodeC2S_Login_Request, encodeMSGID, decodeS2C_Ask_Response} from "../myserver/protos/c2s_proto"


var sock = new ws("ws://127.0.0.1:8801")
sock.on("open", () => {
    console.log("connect success")

    let a = <C2S_Login_Request>{}
    a.account = "zjw"
    a.password = "123"

    let buffer = encodeC2S_Login_Request(a)
    let message = <Message>{
        length: buffer.length,
        msgtype: encodeMSGID.ID_C2S_LOGIN_REQUEST,
        msg: Buffer.from(buffer),
    }

    let buf = Buffer.alloc(message.length + 8)
    buf.writeInt32LE(message.length + 8, 0)
    buf.writeInt32LE(message.msgtype, 4)

    console.log(message)

    message.msg.copy(buf, 8, 0, message.length)
    sock.send(buf)
});

sock.on("message", (data) => {
    console.log("get msg:", data)

    let len = data.readInt32LE(0)
    let msgId = data.readInt32LE(4)
    let payload = Buffer.alloc(len)
    data.copy(payload, 0, 8, len+8)

    let bb = decodeS2C_Ask_Response(payload)

    console.log("msg", len, msgId, bb)
})

sock.on("error", (err) => {
    console.error("error", err)
})

sock.on("close", () => {
    console.log("closed")
})



