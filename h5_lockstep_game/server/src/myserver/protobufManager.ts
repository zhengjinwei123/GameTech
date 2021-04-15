import * as ProtoBuf from "protobufjs"
import {TankClient} from "./tankClient"
import {TankServer} from "./tankServer"
import { S2C_Ask_Response, MSGID, encodeC2S_Login_Request, encodeMSGID, decodeMSGID} from "../myserver/protos/c2s_proto"

export class ProtoBufManager {
    private _mapRequestMessage: Map<string, Function>;
    private _mapType2Proto: Map<string, ProtoBuf.Type>
    private _mapID2Types: Map<number, Array<string>>;
    private _mapType2ID: Map<string, number>

    private static _instance: ProtoBufManager
    static getInstance(): ProtoBufManager {
        if (!this._instance) {
            this._instance = new ProtoBufManager()
        }
        return this._instance
    }

    private constructor() {
        this._mapRequestMessage = new Map<string, Function>();
        this._mapType2Proto = new Map<string, ProtoBuf.Type>();
        this._mapID2Types = new Map<number, Array<string>>();
        this._mapType2ID = new Map<string, number>();
    }

    async initialize(protoFiles: Array<string>) {
        if (!protoFiles || protoFiles.length == 0) {
            return
        }

        const roots = await protoFiles.map(async file => {
            const root = this.initProtoBuf(`./protobuf/${file}.proto`);
            return root
        })

        let fileId = 0
        for (const root of roots) {
            this.onLoadFile(await root, protoFiles[fileId++])
        }

        console.log("protofiles initialize finished...", protoFiles)
    }

    async initProtoBuf(protoFile: string): Promise<ProtoBuf.Root> {
        return await ProtoBuf.load(protoFile)
    }

    onLoadFile(root: protobuf.Root, protoFile: string) {
        this.suckMessageAndEnum(root, protoFile)
    }

    private suckMessageAndEnum(root: ProtoBuf.Root, name: string): void {
        let node: ProtoBuf.NamespaceBase = <ProtoBuf.NamespaceBase>root.get(name)
        if (node) {
            let keywords = ["msgid"]
            let typeArray = node.nestedArray
            let typeItems: Array<ProtoBuf.NamespaceBase> = new Array<ProtoBuf.NamespaceBase>()
            
            typeArray.forEach(typeItem => {
                let item: any = typeItem
                if (item.fields) { // Type
                    typeItems.push(<ProtoBuf.NamespaceBase>typeItem)
                } else if (item.values) { // Enum
                    if (keywords.indexOf(item.name.toLowerCase()) >= 0) {
                        let msgNumKeys = Object.keys(item.values)
                        if (msgNumKeys) {
                            msgNumKeys.forEach(value => {
                                let msgId = item.values[value]
                                this._mapType2ID.set(value, msgId)
                                let typesData = this._mapID2Types.get(msgId)
                                if (!typesData) {
                                    this._mapID2Types.set(msgId, new Array<string>(value))
                                } else {
                                    typesData.push(value)
                                }
                            });
                        }
                    }
                }
            }, this)


            typeItems.forEach(element => {
                let item: any = element
                let itemArray: Array<any> = <Array<any>>item.fieldsArray;
                for (let index = 0; index < itemArray.length; index ++) {
                    let field = itemArray[index];
                    if (keywords.indexOf(field.name.toLowerCase()) != -1) {
                        if (field.options) {
                    
                            this._mapType2Proto.set(field.options.default, item)
                            break;
                        }
                    }
                }
            })

        }
    }

    async handlerRequests(handlerFiles: Array<string>) {
        let protocols = await handlerFiles.map(async className => {
            let xProtocol = `./handlers/${className.toLowerCase()}`
            let protoRequests = await import(xProtocol)
            await ProtoBufManager.getInstance().suckRequestFunction(protoRequests[className])
            return xProtocol
        })
    }

    private suckRequestFunction<T>(c: {new(): T}): void {
        let instance = new c;
        for (let funcName of Object.getOwnPropertyNames(Object.getPrototypeOf(instance))) {
            if (funcName.indexOf('on$$') == 0) {
                let messsageName = funcName.replace('on$$', '')
                if (this._mapRequestMessage.get(messsageName)) {
                    console.error(`${messsageName} 已经在不同的模块加载了`)
                }

                this._mapRequestMessage.set(messsageName, (messsage: any, client: any): number => {
                    return instance[funcName](messsage, client)
                })
            }
        }
    }

    private getMessage(messageType: string): ProtoBuf.Type {
        return <ProtoBuf.Type>this._mapType2Proto.get(messageType)
    }

    getMessageTypeById(messageId: number) {
        let protoTypes = this._mapID2Types.get(messageId)
        if (!protoTypes || protoTypes.length == 0) {
            return null
        }

        if (protoTypes.length > 0) {
            return protoTypes[protoTypes.length - 1]
        }
        return protoTypes[0]
    }

    getMessageById(messageId: number): ProtoBuf.Type {
        // console.log("haha", messageId, this._mapID2Types.keys())
        let protoTypes = this._mapID2Types.get(messageId)
        if (protoTypes && protoTypes.length > 0) {
            return this.getMessage(protoTypes[protoTypes.length - 1])
        } else {
            console.error(`invalid messageId:${messageId}`, protoTypes, this._mapID2Types)
        }
       
        return this.getMessage(protoTypes[0]);
    }

    processMessage(message: Message, client: TankClient) {


        if (!message.msgtype) {
            console.log("fuckaaaaa", message)
        }
        

        let requestMessage = this.getMessageById(message.msgtype)
        try {
            let messageData = requestMessage.decode(message.msg)
            // console.info(`recv2: ${requestMessage.fullName}, ${requestMessage.name}`)

            console.log("getMessage",message.msgtype, messageData.toJSON())

            const reqFunc = this._mapRequestMessage.get(requestMessage.name)
            if (reqFunc) {
                let ret = reqFunc(messageData, client)
                if (ret !== undefined) {
                    if (Number.isInteger(ret)) {
                        this.askReturn(client, message.msgtype, ret)
                    }
                }
            } else {
                console.error(`no process message ${requestMessage.name} ${message.msgtype}`)
            }
        } catch (e) {
            console.error(`catch msg exception222: ${e.message}`)
        }
    }

    askReturn(client: TankClient, messageId: number, errorCode: number) {
        let msg = <S2C_Ask_Response>{}
        msg.askid = messageId
        msg.errorcode = errorCode
        msg.msgid = MSGID.ID_S2C_ASK_RESPONSE

        this.postClientDirectMessage(client, msg)
    }

    postDirectMessage(clientId: number, payLoad: any, messageFactory: any=null) {
        let client = TankServer.getInstance().getClient(clientId)
        if (!client) {
            console.error(`not found client for id:${clientId}`)
        } else {
            this.postClientDirectMessage(client, payLoad, messageFactory)
        }
    }

    postClientDirectMessage(client: TankClient, payLoad: any, messageFactory: any = null): void {

        try {
            if (!messageFactory) {
                // console.log("postClientDirectMessage:", payLoad.msgid,  encodeMSGID[payLoad.msgid])

                if (!encodeMSGID[payLoad.msgid]) {
                    console.log("-------------fuck msg", payLoad)
                }
                messageFactory = this.getMessageById(encodeMSGID[payLoad.msgid])
            }

            let payLoadClone = Object.assign({}, payLoad);

            payLoadClone.msgid = encodeMSGID[payLoad.msgid]
            let errMsg = messageFactory.verify(payLoadClone)
            if (errMsg) {
                throw Error(errMsg)
            }
            let buffer = messageFactory.encode(payLoadClone).finish()
            let msg = <Message>{
                length: buffer.length,
                msgtype: payLoadClone.msgid,
                msg: buffer
            }
            // console.info(`send to client:${client.getClientId()} msg:${JSON.stringify(payLoadClone)}`)
            client.send(msg)
        } catch(e) {
            console.error(`send msg catch error: ${e.message}`, payLoad)
        }
    }

    postMessage(clientId: number, messageType: string, payLoad: any): void {
        let client = TankServer.getInstance().getClient(clientId)
        if (!client) {
            console.error(`not found client:${client.getClientId()}`)
            return
        }
        this.responseMessage(client, payLoad, messageType)
    }

    postMessageById(clientId: number, messageId: number, payload: any): void {
        let client = TankServer.getInstance().getClient(clientId)
        if (!client) {
            console.error(`postMessageById not found client: ${clientId}`)
            return
        }
        let messageType = this.getMessageTypeById(messageId)

        this.responseMessage(client, payload, messageType)
    }

    private packJsonMessage(messageType: string, payload: any): Message {
        let messageFactory = this.getMessage(messageType)
        let errMsg = messageFactory.verify(payload)
        if (errMsg) {
            throw Error(errMsg)
        }
        let body = messageFactory.create(payload)
        let buffer = messageFactory.encode(body).finish()
        let msg = <Message>{
            length: buffer.length,
            msgtype: this._mapType2ID.get(messageType),
            msg: buffer
        }

        return msg
    }

    responseMessage(client: TankClient, payLoad: any, messageType: string): void {
        try {
            client.send(this.packJsonMessage(messageType, payLoad))
        } catch(e) {
            console.error(`responseMessage catch error: ${e.message}`)
        }
    }


}