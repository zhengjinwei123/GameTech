"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tankServer_1 = require("./myserver/tankServer");
class Main {
    static main(name) {
        let server = new tankServer_1.TankServer(name);
        server.startup({
            serverInfo: {
                host: "127.0.0.1",
                port: 8801
            },
            protobuf: {
                proto: [
                    "c2s"
                ],
                handler: ["PlayerHandler", "SyncHandler"]
            },
        });
    }
}
Main.main("tank");
