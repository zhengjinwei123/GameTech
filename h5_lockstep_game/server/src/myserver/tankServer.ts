import WebSocketServerBase from "../libs/net/ws/serverBase"
import { ProtoBufManager } from "./protobufManager"
import {TankClient} from "./tankClient"
import {GAME_STATUS} from "./protos/consts"

import {
    S2C_FrameSync_Response, encodeRET, MSGID, FrameMsg, FrameMsgList,
    S2C_PlayerLeave_Response
} from "./protos/c2s_proto"

export class TankServer extends WebSocketServerBase {

    private _idClientMap: Map<number, TankClient>
    private _socketClientMap: Map<any, TankClient>
    private _gClientId: number 
    private _stepInterval: number
    private _stepTimer: NodeJS.Timeout
    private _stepCommands: Array<FrameMsg> 
    private _stepCommandsHistory: Array<FrameMsgList>
    private _stepCount: number
    private _gameStatus: number
    private _stepUpdateCounter: number
    private _lastUpdateDateTime: number
    private _readyClient: any

    private static _instance: TankServer
    public static getInstance() {
        return this._instance
    }

    constructor(name: string) {
        super(name)

        TankServer._instance = this

        this._socketClientMap = new Map<any, TankClient>() // socke 玩家 map
        this._idClientMap = new Map<number, TankClient>() // id 玩家 map 在线玩家
        this._gClientId = 1; // 全局玩家id 分配

        this._stepInterval = 66; // 帧同步间隔
        this._stepTimer = null // 帧同步定时器句柄

        this._stepCommands = new Array<FrameMsg>() // 帧指令数组
        this._stepCommandsHistory = new Array<FrameMsgList>() // 历史指令, 用于断线重连
        this._stepCount = 0; // 当前帧

        this._gameStatus = GAME_STATUS.WAIT
        this._stepUpdateCounter = 0
        this._lastUpdateDateTime = Date.now()

        this._readyClient = {}
    }

    private update(deltaTime: number) {
        if (this._gameStatus === GAME_STATUS.START) {
            this._stepUpdateCounter += deltaTime
            if (this._stepUpdateCounter >= this._stepInterval) {
                this._stepCount++;
                this.stepUpdate()
                this._stepUpdateCounter -= this._stepInterval
            }
        }
    }

    checkUserHasLogin(uid: number): boolean {
        if (this._readyClient[uid]) {
            return true
        }
        return false
    }

    onClientReady(uid: number) {
        if (this._gameStatus === GAME_STATUS.START) {
            return
        }

        this._readyClient[uid] = 1;

        if (Object.keys(this._readyClient).length >= 2) {
            this._gameStatus = GAME_STATUS.START
        }
    }

    // 玩家离开
    onClientExit(uid: number) {
        if (this._readyClient[uid]) {
            delete this._readyClient[uid]
        }

        const readyClientNum = Object.keys(this._readyClient).length
        if (readyClientNum < 2) {
            this._gameStatus = GAME_STATUS.WAIT
        }

        if (readyClientNum == 0) {
            console.log("玩家离开 清空历史帧")
            this._stepCommandsHistory = new Array<FrameMsgList>();
        }

        console.log("玩家离开", uid)
        // 广播给其他玩家
        this._idClientMap.forEach((client: TankClient, key: number) => {

            if (client.getUid() !== uid) {
                let msg = <S2C_PlayerLeave_Response>{}
                msg.msgid = MSGID.ID_S2C_PLAYER_LEAVE_RESPONSE
                msg.ret = encodeRET.OK;
                msg.clientId = uid
    
                ProtoBufManager.getInstance().postClientDirectMessage(client, msg)
            }
        })
    }

    // 存储帧
    pushCommand(clientId: number, op: number) {
        let client = this.getClient(clientId)
        if (client) {

            if (this._gameStatus === GAME_STATUS.START) {

                const frame = <FrameMsg>{
                    id: client.getUid(),
                    op: op
                }
                this._stepCommands.push(frame)
            }
        }
    }

    public getStepHistory(): Array<FrameMsgList> {
        if (this._idClientMap.size >= 2) {
            return this._stepCommandsHistory
        }
        return new Array<FrameMsgList>()
    }

    private stepUpdate() {
        let message = {}

        // // 过滤同帧多次指令
        this._idClientMap.forEach((client: TankClient, key: number) => {
            message[key] = {
                step: this._stepCount,
                id: client.getUid(),
                op: 0,
            }
        })

        for (let i = 0; i < this._stepCommands.length; ++i) {
            let command = this._stepCommands[i]
            command.step = this._stepCount
            message[command.clientId] = command
        }


        // console.log("frame", message)

        this._stepCommands = new Array()

        // 发送
        let commands = new Array<FrameMsg>()
        for (let key in message) {

            const frame = <FrameMsg>{}
            frame.clientId = message[key].id
            frame.op = message[key].op;
            frame.step = message[key].step;

            commands.push(frame)
        }

        // 存储历史帧

        const frameList = <FrameMsgList>{
            frame: commands
        }

        this._stepCommandsHistory.push(frameList)

        // 广播给所有玩家
        this._idClientMap.forEach((client: TankClient, key: number) => {

            // console.log("广播帧: client", client.getClientId())

            if (client.isReady()) {
                let msg = <S2C_FrameSync_Response>{}
                msg.msgid = MSGID.ID_S2C_FRAMESYNC_RESPONSE
                msg.frames = commands
                msg.ret = encodeRET.OK;
        
                // console.log("广播帧:", client.getClientId(), commands)

                ProtoBufManager.getInstance().postClientDirectMessage(client, msg)
            }
        })
    }

    getUidList(excludeId: number) {

        let arr = new Array<number>()
        this._idClientMap.forEach((client: TankClient, key: number) => {
            if (client.isReady()) {
                if (excludeId !== client.getUid()) {
                    arr.push(client.getUid())
                }
            }
        })

        return arr
    }

    public broadcastMsg(excludeUid: number, msg: any) {

        this._idClientMap.forEach((client: TankClient, key: number) => {
            if (excludeUid !== client.getUid()) {

                if (client.isReady()) {
                    ProtoBufManager.getInstance().postClientDirectMessage(client, msg)
                }
            }
        })
    }

    public startup(serverConfig: any) {
        this.initialize(serverConfig)

        let exitAction: Function = () =>{
            this.dispose()

            // 关闭定时器
            if (this._stepTimer) {
                clearInterval(this._stepTimer)
                this._stepTimer = null;
            }
           
            process.exit(0)
        }

        // 处理中断退出
        process.on("SIGINT", () => {
            exitAction()
        })

        process.on("message", (msg: string) => {
            if (msg === "shutdown") {
                exitAction()
            }
        })

        // 开启帧同步定时器
        this._lastUpdateDateTime = Date.now()
        this._stepTimer = setInterval(() => {
            let now = Date.now()
            let dt = now - this._lastUpdateDateTime
            this._lastUpdateDateTime = now
            this.update(dt)
        }, 0)
    }

    protected async initialize(serverConfig: any) {
        super.initialize(serverConfig)

        /// 数据库初始化

        // 加载protobuf
        await ProtoBufManager.getInstance().initialize(serverConfig.protobuf.proto)
        await ProtoBufManager.getInstance().handlerRequests(serverConfig.protobuf.handler)

        // 加载配置


        super.listen((err: any) => {
            if (err) {
                console.error("err:", err)
                process.exit(1)
            }
        })
    }

    private closeSocket(socket: any) {
        if (this._socketClientMap.has(socket)) {
            let client: TankClient = <TankClient>this._socketClientMap.get(socket)

            const id = client.getClientId();
            if (client) {
                this._idClientMap.delete(client.getClientId())
                this._socketClientMap.delete(socket)
                client.close()
            }
        }
    }

    protected onConnection(socket: any): void {
        console.log(`a socket connect to me, ${socket}`)

        let client: TankClient = new TankClient(socket)
        if (client) {
            let clientId = this._gClientId ++;
            client.initialize(clientId)
            this._idClientMap.set(clientId, client)
            this._socketClientMap.set(socket, client)
        }

        client.on("end", () => {
      
            this.onClientExit(client.getUid())

            this.closeSocket(socket)
        })

        client.on("msg", (msg: Message) => {
            //
            ProtoBufManager.getInstance().processMessage(msg, client)
        })

        client.on("error", (error) => {
        
            this.onClientExit(client.getUid())

            this.closeSocket(client.getSocket())
        })

        client.on("schedule", () => {
            console.log("receive a schedule message")
        })
    }

    public getClient(clientId: number): TankClient|undefined {

        let client = this._idClientMap.get(clientId)
        if (!client) {
            return undefined
        }
        return client
    }
}
