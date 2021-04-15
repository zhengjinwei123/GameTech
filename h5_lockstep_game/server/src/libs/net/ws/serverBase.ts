let ws = require("nodejs-websocket")
// let protobuf = require("protobufjs")
// import * as http from "http"
import * as ProtoBuf from 'protobufjs';

abstract class WebSocketServerBase {
    private _server: any
    protected _host: string
    protected _port: number
    protected _name: string
    private _ready: boolean = false

    constructor(name: string) {
        this._host = ''
        this._port = 0;
        this._name = name
        this._server = null

        this._ready = false
    }

    protected initialize(serverConfig: any): void {
        if (serverConfig.serverInfo != undefined) {
            this._host = serverConfig.serverInfo.host
            this._port = serverConfig.serverInfo.port
        }
    }

    protected listen(cb: Function) {
        this._server = ws.createServer((conn: any) => {
            this.onConnection(conn)
        }).listen(this._port, this._host, cb)

        if (this._server) {
            this._server.on("listening", () => {
                this._ready = true
                console.log(`server:${this._name} is listening at ${this._host}:${this._port}`)
            })

            this._server.on("close", () => {
                process.exit(1);
            })

            this._server.on("error", (err: any) => {
                process.exit(1);
            })
        }
    }

    protected async initProtoBuf(pbFile: string): Promise<ProtoBuf.Root> {
        return await ProtoBuf.load(pbFile)
    }

    public dispose(): void {
        if (this._ready) {
            this._server.close()
        }
    }

    public broadcastBinary(data: Buffer): void {
        if (!this._ready) {
            return
        }

        this._server.connections.forEach( (conn: any) => {
            conn.sendBinary(data)
        });
    }

    protected abstract onConnection(socket: any): void;
}


export default WebSocketServerBase
