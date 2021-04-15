
import {TankClient} from "../tankClient"
import {TankServer} from "../tankServer"
import {C2S_FrameSync_Request} from "../protos/c2s_proto"

export class SyncHandler {

    // 玩家发来的帧
    public on$$C2S_FrameSync_Request(message: C2S_FrameSync_Request, client: TankClient) {
        const op = message.op
        
        // console.log("玩家发来的帧", message)

        TankServer.getInstance().pushCommand(client.getClientId(), op)
    }
}