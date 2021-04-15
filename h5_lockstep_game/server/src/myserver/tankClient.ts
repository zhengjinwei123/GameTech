import WSClientBase from "../libs/net/ws/clientbase"
import {PLAYER_STATUS} from "./protos/consts"

class TankClient extends WSClientBase {

    private _status: number
    private _uid: number

    constructor(socket: any) {
        super(socket)

        this._clientId = -1
        this._uid = -1;
        this._status = PLAYER_STATUS.CONNECTED // 设置已连接
    }

    public getUid(): number {
        return this._uid
    }

    public setReady(uid: number) {
        this._status = PLAYER_STATUS.READY
        this._uid = uid
    }

    public isReady() {
        return  this._status == PLAYER_STATUS.READY
    }

    public getClientId(): number {
        return this._clientId
    }

    public setClientId(clientId: number) {
        this._clientId = clientId
    }

    public setActive(): void {
        this._lastActiveTimestamp = Date.now()
    }

    public send(message: Message): void {
        super.send(message)

        let buf = Buffer.alloc(message.length + 8)
        buf.writeInt32LE(message.length + 8, 0)
        buf.writeInt32LE(message.msgtype, 4)
        message.msg.copy(buf, 8, 0, message.length)
        this._socket.send(buf)
    }

    public onError(err: string): void
    {
        this.emit("error", err)
    }

    public onMessage(message: Message): void
    {
        this.setActive()
        this.emit("msg", message)
    }

    public onSchedule(): void
    {
        this.emit("schedule")
    }

    public onEnd(): void
    {
        this.emit("end")
    }
}

export {
    TankClient
}