"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtoBufManager = void 0;
const ProtoBuf = __importStar(require("protobufjs"));
const tankServer_1 = require("./tankServer");
const c2s_proto_1 = require("../myserver/protos/c2s_proto");
class ProtoBufManager {
    constructor() {
        this._mapRequestMessage = new Map();
        this._mapType2Proto = new Map();
        this._mapID2Types = new Map();
        this._mapType2ID = new Map();
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new ProtoBufManager();
        }
        return this._instance;
    }
    initialize(protoFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!protoFiles || protoFiles.length == 0) {
                return;
            }
            const roots = yield protoFiles.map((file) => __awaiter(this, void 0, void 0, function* () {
                const root = this.initProtoBuf(`./protobuf/${file}.proto`);
                return root;
            }));
            let fileId = 0;
            for (const root of roots) {
                this.onLoadFile(yield root, protoFiles[fileId++]);
            }
            console.log("protofiles initialize finished...", protoFiles);
        });
    }
    initProtoBuf(protoFile) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProtoBuf.load(protoFile);
        });
    }
    onLoadFile(root, protoFile) {
        this.suckMessageAndEnum(root, protoFile);
    }
    suckMessageAndEnum(root, name) {
        let node = root.get(name);
        if (node) {
            let keywords = ["msgid"];
            let typeArray = node.nestedArray;
            let typeItems = new Array();
            typeArray.forEach(typeItem => {
                let item = typeItem;
                if (item.fields) { // Type
                    typeItems.push(typeItem);
                }
                else if (item.values) { // Enum
                    if (keywords.indexOf(item.name.toLowerCase()) >= 0) {
                        let msgNumKeys = Object.keys(item.values);
                        if (msgNumKeys) {
                            msgNumKeys.forEach(value => {
                                let msgId = item.values[value];
                                this._mapType2ID.set(value, msgId);
                                let typesData = this._mapID2Types.get(msgId);
                                if (!typesData) {
                                    this._mapID2Types.set(msgId, new Array(value));
                                }
                                else {
                                    typesData.push(value);
                                }
                            });
                        }
                    }
                }
            }, this);
            typeItems.forEach(element => {
                let item = element;
                let itemArray = item.fieldsArray;
                for (let index = 0; index < itemArray.length; index++) {
                    let field = itemArray[index];
                    if (keywords.indexOf(field.name.toLowerCase()) != -1) {
                        if (field.options) {
                            this._mapType2Proto.set(field.options.default, item);
                            break;
                        }
                    }
                }
            });
        }
    }
    handlerRequests(handlerFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            let protocols = yield handlerFiles.map((className) => __awaiter(this, void 0, void 0, function* () {
                let xProtocol = `./handlers/${className.toLowerCase()}`;
                let protoRequests = yield Promise.resolve().then(() => __importStar(require(xProtocol)));
                yield ProtoBufManager.getInstance().suckRequestFunction(protoRequests[className]);
                return xProtocol;
            }));
        });
    }
    suckRequestFunction(c) {
        let instance = new c;
        for (let funcName of Object.getOwnPropertyNames(Object.getPrototypeOf(instance))) {
            if (funcName.indexOf('on$$') == 0) {
                let messsageName = funcName.replace('on$$', '');
                if (this._mapRequestMessage.get(messsageName)) {
                    console.error(`${messsageName} 已经在不同的模块加载了`);
                }
                this._mapRequestMessage.set(messsageName, (messsage, client) => {
                    return instance[funcName](messsage, client);
                });
            }
        }
    }
    getMessage(messageType) {
        return this._mapType2Proto.get(messageType);
    }
    getMessageTypeById(messageId) {
        let protoTypes = this._mapID2Types.get(messageId);
        if (!protoTypes || protoTypes.length == 0) {
            return null;
        }
        if (protoTypes.length > 0) {
            return protoTypes[protoTypes.length - 1];
        }
        return protoTypes[0];
    }
    getMessageById(messageId) {
        // console.log("haha", messageId, this._mapID2Types.keys())
        let protoTypes = this._mapID2Types.get(messageId);
        if (protoTypes && protoTypes.length > 0) {
            return this.getMessage(protoTypes[protoTypes.length - 1]);
        }
        else {
            console.error(`invalid messageId:${messageId}`, protoTypes, this._mapID2Types);
        }
        return this.getMessage(protoTypes[0]);
    }
    processMessage(message, client) {
        if (!message.msgtype) {
            console.log("fuckaaaaa", message);
        }
        let requestMessage = this.getMessageById(message.msgtype);
        try {
            let messageData = requestMessage.decode(message.msg);
            // console.info(`recv2: ${requestMessage.fullName}, ${requestMessage.name}`)
            console.log("getMessage", message.msgtype, messageData.toJSON());
            const reqFunc = this._mapRequestMessage.get(requestMessage.name);
            if (reqFunc) {
                let ret = reqFunc(messageData, client);
                if (ret !== undefined) {
                    if (Number.isInteger(ret)) {
                        this.askReturn(client, message.msgtype, ret);
                    }
                }
            }
            else {
                console.error(`no process message ${requestMessage.name} ${message.msgtype}`);
            }
        }
        catch (e) {
            console.error(`catch msg exception222: ${e.message}`);
        }
    }
    askReturn(client, messageId, errorCode) {
        let msg = {};
        msg.askid = messageId;
        msg.errorcode = errorCode;
        msg.msgid = "ID_S2C_ASK_RESPONSE" /* ID_S2C_ASK_RESPONSE */;
        this.postClientDirectMessage(client, msg);
    }
    postDirectMessage(clientId, payLoad, messageFactory = null) {
        let client = tankServer_1.TankServer.getInstance().getClient(clientId);
        if (!client) {
            console.error(`not found client for id:${clientId}`);
        }
        else {
            this.postClientDirectMessage(client, payLoad, messageFactory);
        }
    }
    postClientDirectMessage(client, payLoad, messageFactory = null) {
        try {
            if (!messageFactory) {
                // console.log("postClientDirectMessage:", payLoad.msgid,  encodeMSGID[payLoad.msgid])
                if (!c2s_proto_1.encodeMSGID[payLoad.msgid]) {
                    console.log("-------------fuck msg", payLoad);
                }
                messageFactory = this.getMessageById(c2s_proto_1.encodeMSGID[payLoad.msgid]);
            }
            let payLoadClone = Object.assign({}, payLoad);
            payLoadClone.msgid = c2s_proto_1.encodeMSGID[payLoad.msgid];
            let errMsg = messageFactory.verify(payLoadClone);
            if (errMsg) {
                throw Error(errMsg);
            }
            let buffer = messageFactory.encode(payLoadClone).finish();
            let msg = {
                length: buffer.length,
                msgtype: payLoadClone.msgid,
                msg: buffer
            };
            // console.info(`send to client:${client.getClientId()} msg:${JSON.stringify(payLoadClone)}`)
            client.send(msg);
        }
        catch (e) {
            console.error(`send msg catch error: ${e.message}`, payLoad);
        }
    }
    postMessage(clientId, messageType, payLoad) {
        let client = tankServer_1.TankServer.getInstance().getClient(clientId);
        if (!client) {
            console.error(`not found client:${client.getClientId()}`);
            return;
        }
        this.responseMessage(client, payLoad, messageType);
    }
    postMessageById(clientId, messageId, payload) {
        let client = tankServer_1.TankServer.getInstance().getClient(clientId);
        if (!client) {
            console.error(`postMessageById not found client: ${clientId}`);
            return;
        }
        let messageType = this.getMessageTypeById(messageId);
        this.responseMessage(client, payload, messageType);
    }
    packJsonMessage(messageType, payload) {
        let messageFactory = this.getMessage(messageType);
        let errMsg = messageFactory.verify(payload);
        if (errMsg) {
            throw Error(errMsg);
        }
        let body = messageFactory.create(payload);
        let buffer = messageFactory.encode(body).finish();
        let msg = {
            length: buffer.length,
            msgtype: this._mapType2ID.get(messageType),
            msg: buffer
        };
        return msg;
    }
    responseMessage(client, payLoad, messageType) {
        try {
            client.send(this.packJsonMessage(messageType, payLoad));
        }
        catch (e) {
            console.error(`responseMessage catch error: ${e.message}`);
        }
    }
}
exports.ProtoBufManager = ProtoBufManager;
