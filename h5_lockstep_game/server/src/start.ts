import {TankServer} from "./myserver/tankServer"

class Main {
    static main(name: string): void {
        let server = new TankServer(name)
        server.startup({
            serverInfo: {
                host: "127.0.0.1",
                port: 8801
            },
            protobuf: {
                proto:  [
                    "c2s"
                ],
                handler: ["PlayerHandler", "SyncHandler"]
            },
        })
    }
}

Main.main("tank")

