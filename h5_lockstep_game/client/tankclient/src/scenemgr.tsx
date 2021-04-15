import {TankBase} from "./spirit/tankBase"
import {TankFactory} from "./spirit/tank"
import {Position} from "./spirit/util"
import {DIRECT} from "./spirit/consts"
import {FrameMgr} from "./framemgr"

export class SceneMgr {
    allTanks: {}
    mainRoleId: number
    width: number
    height: number
    sceneElement: any
    renderTimer: any
    lastUpdate: number
    stepInterval: number
    
    static _instance: SceneMgr = new SceneMgr();
    static getInstance(): SceneMgr {
        return this._instance;
    }

    constructor() {
        this.allTanks = {}
        this.mainRoleId = -1
        this.width = 1000;
        this.height = 800;
        
        this.lastUpdate = Date.now()
        this.stepInterval = 0;
    }

     // 渲染定时器
     logicProcess() {
        let now = Date.now()
        let dt = now - this.lastUpdate
        this.lastUpdate = now
        FrameMgr.getInstance().Update(dt)
    }

    StartGameLoop(interval: number, sceneElement: HTMLElement) {
        if (this.stepInterval > 0) {
            return;
        }

        this.stepInterval = interval
        this.sceneElement = sceneElement;

        console.log("开启游戏循环")
        // 逻辑帧， 一秒15帧
        setInterval(() => {
            this.logicProcess();
        }, 0)

        // 渲染帧 一秒30帧
        setInterval(() => {
            this.Render();
        }, 33)
    }

    getBornRandomePos() {
        // const x = Math.floor(Math.random()*400);
        // const y = Math.floor(Math.random()*700);

        return {
            x : 400, y: 700
        }
    }

    createMainRole(tankId: number) {
        const randPos = this.getBornRandomePos()

        this.mainRoleId = tankId
        this.allTanks[tankId] = TankFactory.createSmallGoodTank(new Position(randPos.x, randPos.y), DIRECT.UP, this.width, this.height)
    }

    GetMainRole(): TankBase {
        return this.allTanks[this.mainRoleId]
    }

    AddTank(tankId: number) {
        const randPos = this.getBornRandomePos()
        this.allTanks[tankId] = TankFactory.createSmallBadTank(new Position(randPos.x, randPos.y), DIRECT.UP, this.width, this.height)
    }

    DeleteTank(tankId: number) {
        if (this.allTanks[tankId]) {
            delete this.allTanks[tankId]
        }
    }

    GetTank(tankId: number): TankBase {
        if (this.allTanks[tankId]) {
            return this.allTanks[tankId]
        }
        return null
    }

    Move(dt: number) {
        for (let tankId in this.allTanks) {
            this.allTanks[tankId].move(dt)
        }
    }

    // 渲染
    Render() {
        if ( this.sceneElement) {
            //context对象
            let ctx = this.sceneElement.getContext('2d');
            const tempCanvas = document.createElement("canvas")
            const tempCtx = tempCanvas.getContext("2d")
            tempCanvas.width = 1000;
            tempCanvas.height = 800;
            // 渲染坦克
            for (let tankId in this.allTanks) {
                this.allTanks[tankId].draw(tempCtx)
            }
           
            ctx.clearRect(0,0, 1000, 800);            //更新之前先清除画布
            ctx.drawImage(tempCanvas, 0, 0, 1000, 800)
          }
    }
}