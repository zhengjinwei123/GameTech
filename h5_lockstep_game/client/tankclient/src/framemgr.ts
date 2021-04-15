import {SceneMgr} from "./scenemgr"


export class FrameMgr {

    frames: Array<any> // 所有帧
    stepTime: number // 当前帧号
    stepUpdateCounter: number // 定时间隔
    stepInterval: number
    isFastRunning: boolean
    runningCommands: any

    loginFastRunningLastFrame: any // 登录追帧 最后一帧的帧编号
  

    static _instance: FrameMgr = new FrameMgr();
    static getInstance(): FrameMgr {
        return this._instance;
    }

    constructor() {
        this.frames = new Array<any>()
        this.stepUpdateCounter = 0;
        this.isFastRunning = false
        this.runningCommands = null
    }

    setLoginFastRunningLastFrame(frame: any) {
        console.log("设置 最后一帧", frame)
        this.loginFastRunningLastFrame = frame
    }

    setStepInterval(interval: number) {
        this.stepInterval = interval
    }

    InitFrame(historyFrames: Array<any>) {
        if (historyFrames && historyFrames.length) {
            this.frames = historyFrames
        }
    }

    AddFrame(frame) {
        this.frames.push(frame)
    }

    Update(deltaTime: number) {
        if (this.frames.length) {
            // 超过3帧就要追帧
            let scale = Math.ceil(this.frames.length / 3)
            if (scale > 10) scale = 10

            this.isFastRunning = (scale > 1)
        
            let ms = deltaTime * scale
            if (this.runningCommands == null) {
                this.runningCommands = this.frames[0]
                this.runningCommands.ms = this.stepInterval
            }

            // 执行时间不能大于剩余时间
            if (this.runningCommands.ms < ms) {
                ms = this.runningCommands.ms
            }

            // 查看帧中是否有指令
            for (let i = 0; i < this.runningCommands.length; ++i) {
                let command = this.runningCommands[i]

                let tank = SceneMgr.getInstance().GetTank(command.clientId)
                if (tank && command.op) {
                    // 改变方向 和发射子弹
                    tank.recvOp(command.op, ms)
                }

                   // 追到最后一帧了, 设置tank 到初始位置
                if (this.loginFastRunningLastFrame &&
                    command.step == this.loginFastRunningLastFrame.step &&
                    this.loginFastRunningLastFrame.clientId == command.clientId) {
                    const bornPos = SceneMgr.getInstance().getBornRandomePos()

                    if (tank) {
                        tank.setBornPosAndDirection(bornPos.x, bornPos.y)
                    }
                    console.log("设置tank 到出生位置", this.loginFastRunningLastFrame, command)
                }
            }

            this.runningCommands.ms -=  ms
            if (this.runningCommands.ms <= 0) {
                this.runningCommands = null
                this.frames.shift()
            }
        }
    }
}