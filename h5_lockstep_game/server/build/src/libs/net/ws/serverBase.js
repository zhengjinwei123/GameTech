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
let ws = require("nodejs-websocket");
// let protobuf = require("protobufjs")
// import * as http from "http"
const ProtoBuf = __importStar(require("protobufjs"));
class WebSocketServerBase {
    constructor(name) {
        this._ready = false;
        this._host = '';
        this._port = 0;
        this._name = name;
        this._server = null;
        this._ready = false;
    }
    initialize(serverConfig) {
        if (serverConfig.serverInfo != undefined) {
            this._host = serverConfig.serverInfo.host;
            this._port = serverConfig.serverInfo.port;
        }
    }
    listen(cb) {
        this._server = ws.createServer((conn) => {
            this.onConnection(conn);
        }).listen(this._port, this._host, cb);
        if (this._server) {
            this._server.on("listening", () => {
                this._ready = true;
                console.log(`server:${this._name} is listening at ${this._host}:${this._port}`);
            });
            this._server.on("close", () => {
                process.exit(1);
            });
            this._server.on("error", (err) => {
                process.exit(1);
            });
        }
    }
    initProtoBuf(pbFile) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProtoBuf.load(pbFile);
        });
    }
    dispose() {
        if (this._ready) {
            this._server.close();
        }
    }
    broadcastBinary(data) {
        if (!this._ready) {
            return;
        }
        this._server.connections.forEach((conn) => {
            conn.sendBinary(data);
        });
    }
}
exports.default = WebSocketServerBase;
