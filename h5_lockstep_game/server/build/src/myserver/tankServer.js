"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TankServer = void 0;
const serverBase_1 = __importDefault(require("../libs/net/ws/serverBase"));
const protobufManager_1 = require("./protobufManager");
const tankClient_1 = require("./tankClient");
const consts_1 = require("./protos/consts");
const c2s_proto_1 = require("./protos/c2s_proto");
class TankServer extends serverBase_1.default {
    constructor(name) {
        super(name);
        TankServer._instance = this;
        this._socketClientMap = new Map(); // socke 玩家 map
        this._idClientMap = new Map(); // id 玩家 map 在线玩家
        this._gClientId = 1; // 全局玩家id 分配
        this._stepInterval = 66; // 帧同步间隔
        this._stepTimer = null; // 帧同步定时器句柄
        this._stepCommands = new Array(); // 帧指令数组
        this._stepCommandsHistory = new Array(); // 历史指令, 用于断线重连
        this._stepCount = 0; // 当前帧
        this._gameStatus = consts_1.GAME_STATUS.WAIT;
        this._stepUpdateCounter = 0;
        this._lastUpdateDateTime = Date.now();
        this._readyClient = {};
    }
    static getInstance() {
        return this._instance;
    }
    update(deltaTime) {
        if (this._gameStatus === consts_1.GAME_STATUS.START) {
            this._stepUpdateCounter += deltaTime;
            if (this._stepUpdateCounter >= this._stepInterval) {
                this._stepCount++;
                this.stepUpdate();
                this._stepUpdateCounter -= this._stepInterval;
            }
        }
    }
    checkUserHasLogin(uid) {
        if (this._readyClient[uid]) {
            return true;
        }
        return false;
    }
    onClientReady(uid) {
        if (this._gameStatus === consts_1.GAME_STATUS.START) {
            return;
        }
        this._readyClient[uid] = 1;
        if (Object.keys(this._readyClient).length >= 2) {
            this._gameStatus = consts_1.GAME_STATUS.START;
        }
    }
    // 玩家离开
    onClientExit(uid) {
        if (this._readyClient[uid]) {
            delete this._readyClient[uid];
        }
        const readyClientNum = Object.keys(this._readyClient).length;
        if (readyClientNum < 2) {
            this._gameStatus = consts_1.GAME_STATUS.WAIT;
        }
        if (readyClientNum == 0) {
            console.log("玩家离开 清空历史帧");
            this._stepCommandsHistory = new Array();
        }
        console.log("玩家离开", uid);
        // 广播给其他玩家
        this._idClientMap.forEach((client, key) => {
            if (client.getUid() !== uid) {
                let msg = {};
                msg.msgid = "ID_S2C_PLAYER_LEAVE_RESPONSE" /* ID_S2C_PLAYER_LEAVE_RESPONSE */;
                msg.ret = c2s_proto_1.encodeRET.OK;
                msg.clientId = uid;
                protobufManager_1.ProtoBufManager.getInstance().postClientDirectMessage(client, msg);
            }
        });
    }
    // 存储帧
    pushCommand(clientId, op) {
        let client = this.getClient(clientId);
        if (client) {
            if (this._gameStatus === consts_1.GAME_STATUS.START) {
                const frame = {
                    id: client.getUid(),
                    op: op
                };
                this._stepCommands.push(frame);
            }
        }
    }
    getStepHistory() {
        if (this._idClientMap.size >= 2) {
            return this._stepCommandsHistory;
        }
        return new Array();
    }
    stepUpdate() {
        let message = {};
        // // 过滤同帧多次指令
        this._idClientMap.forEach((client, key) => {
            message[key] = {
                step: this._stepCount,
                id: client.getUid(),
                op: 0,
            };
        });
        for (let i = 0; i < this._stepCommands.length; ++i) {
            let command = this._stepCommands[i];
            command.step = this._stepCount;
            message[command.clientId] = command;
        }
        // console.log("frame", message)
        this._stepCommands = new Array();
        // 发送
        let commands = new Array();
        for (let key in message) {
            const frame = {};
            frame.clientId = message[key].id;
            frame.op = message[key].op;
            frame.step = message[key].step;
            commands.push(frame);
        }
        // 存储历史帧
        const frameList = {
            frame: commands
        };
        this._stepCommandsHistory.push(frameList);
        // 广播给所有玩家
        this._idClientMap.forEach((client, key) => {
            // console.log("广播帧: client", client.getClientId())
            if (client.isReady()) {
                let msg = {};
                msg.msgid = "ID_S2C_FRAMESYNC_RESPONSE" /* ID_S2C_FRAMESYNC_RESPONSE */;
                msg.frames = commands;
                msg.ret = c2s_proto_1.encodeRET.OK;
                // console.log("广播帧:", client.getClientId(), commands)
                protobufManager_1.ProtoBufManager.getInstance().postClientDirectMessage(client, msg);
            }
        });
    }
    getUidList(excludeId) {
        let arr = new Array();
        this._idClientMap.forEach((client, key) => {
            if (client.isReady()) {
                if (excludeId !== client.getUid()) {
                    arr.push(client.getUid());
                }
            }
        });
        return arr;
    }
    broadcastMsg(excludeUid, msg) {
        this._idClientMap.forEach((client, key) => {
            if (excludeUid !== client.getUid()) {
                if (client.isReady()) {
                    protobufManager_1.ProtoBufManager.getInstance().postClientDirectMessage(client, msg);
                }
            }
        });
    }
    startup(serverConfig) {
        this.initialize(serverConfig);
        let exitAction = () => {
            this.dispose();
            // 关闭定时器
            if (this._stepTimer) {
                clearInterval(this._stepTimer);
                this._stepTimer = null;
            }
            process.exit(0);
        };
        // 处理中断退出
        process.on("SIGINT", () => {
            exitAction();
        });
        process.on("message", (msg) => {
            if (msg === "shutdown") {
                exitAction();
            }
        });
        // 开启帧同步定时器
        this._lastUpdateDateTime = Date.now();
        this._stepTimer = setInterval(() => {
            let now = Date.now();
            let dt = now - this._lastUpdateDateTime;
            this._lastUpdateDateTime = now;
            this.update(dt);
        }, 0);
    }
    initialize(serverConfig) {
        const _super = Object.create(null, {
            initialize: { get: () => super.initialize },
            listen: { get: () => super.listen }
        });
        return __awaiter(this, void 0, void 0, function* () {
            _super.initialize.call(this, serverConfig);
            /// 数据库初始化
            // 加载protobuf
            yield protobufManager_1.ProtoBufManager.getInstance().initialize(serverConfig.protobuf.proto);
            yield protobufManager_1.ProtoBufManager.getInstance().handlerRequests(serverConfig.protobuf.handler);
            // 加载配置
            _super.listen.call(this, (err) => {
                if (err) {
                    console.error("err:", err);
                    process.exit(1);
                }
            });
        });
    }
    closeSocket(socket) {
        if (this._socketClientMap.has(socket)) {
            let client = this._socketClientMap.get(socket);
            const id = client.getClientId();
            if (client) {
                this._idClientMap.delete(client.getClientId());
                this._socketClientMap.delete(socket);
                client.close();
            }
        }
    }
    onConnection(socket) {
        console.log(`a socket connect to me, ${socket}`);
        let client = new tankClient_1.TankClient(socket);
        if (client) {
            let clientId = this._gClientId++;
            client.initialize(clientId);
            this._idClientMap.set(clientId, client);
            this._socketClientMap.set(socket, client);
        }
        client.on("end", () => {
            this.onClientExit(client.getUid());
            this.closeSocket(socket);
        });
        client.on("msg", (msg) => {
            //
            protobufManager_1.ProtoBufManager.getInstance().processMessage(msg, client);
        });
        client.on("error", (error) => {
            this.onClientExit(client.getUid());
            this.closeSocket(client.getSocket());
        });
        client.on("schedule", () => {
            console.log("receive a schedule message");
        });
    }
    getClient(clientId) {
        let client = this._idClientMap.get(clientId);
        if (!client) {
            return undefined;
        }
        return client;
    }
}
exports.TankServer = TankServer;
