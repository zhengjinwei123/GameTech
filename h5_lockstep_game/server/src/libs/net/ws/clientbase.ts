import { EventEmitter} from "events"
import * as WebSocket from "ws"

abstract class WSClientBase extends EventEmitter {
    protected _socket: any
    protected _lastActiveTimestamp: number
    protected _lostHeartbeat: boolean
    protected _checkActiveIntervalId: NodeJS.Timer
    protected _clientId: number = 0
    private _buffer: any

    protected constructor(socket: any) {
        super()

        this._socket = socket
        this._buffer = null
        this._lastActiveTimestamp = Date.now()
        this._lostHeartbeat = false
        this._checkActiveIntervalId = setInterval(() => {
            let now = Date.now()
            if (now - this._lastActiveTimestamp > 1000 * 60 * 10) {
                // 超过10分钟没有收到消息
                this._lostHeartbeat = true
            } else {
                this.onSchedule()
            }
        }, 1000 * 60) // 一分钟检查一次心跳包
    }

    public initialize(clientId: number): void {
        this._clientId = clientId

        this._socket.on("binary", (inStream: any) => {
            if (this._buffer == null) {
                this._buffer = Buffer.alloc(0)
            }

            inStream.on("readable", () => {
                let newData = inStream.read()
                if (newData) {
                    this._buffer = Buffer.concat([this._buffer, newData], this._buffer.length + newData.length)
                }
            })
    
            inStream.on("end", () => {
                // console.log("received: " + this._buffer.length + " bytes of binary data")

                // head + body
                // head: len:4 + type:4

                let len = <number>this._buffer.readInt32LE(0)
                if (len > 1024*1024 || len < 0) {
                    return
                }

                let inMessage = <Message>{}
                inMessage.length = len
                inMessage.msgtype = <number>this._buffer.readInt32LE(4)
                if (len > 0) {
                    inMessage.msg = Buffer.alloc(len - 8)
                    this._buffer.copy(inMessage.msg, 0, 8, len)
                }

                this.onMessage(inMessage)

                if (this._buffer.length > len) {
                    this._buffer = this._buffer.slice(len)
                } else {
                    this._buffer = null
                }
            })
        })
    
        this._socket.on("close", (code: any, reason: any) => {
            console.log("zjw connection closed", code, reason)
            this.onEnd()
        })

        this._socket.on("error", (err: any) => {
            this.onError(`error: ${err}`)
        })

        this._socket.on("text", (str: string) => {

        })
    }

    public getClientId(): number {
        return this._clientId
    }

    public getSocket(): any {
        return this._socket
    }

    public close(): void {
        this._socket.close()
        clearInterval(this._checkActiveIntervalId);
    }

    protected setActive(): void {
        this._lastActiveTimestamp = Date.now()
    }

    protected send(message: Message): void {
        this.setActive()
    }

    protected abstract onError(err: string): void;
    protected abstract onMessage(message: Message): void;
    protected abstract onSchedule(): void;
    protected abstract onEnd(): void;
}

export default WSClientBase
