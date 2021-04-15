import {TankBase} from "./tankBase"
import {DIRECT} from "./consts"
import {Position} from "./util"



export default class Bullet {
    owner: TankBase // 拥有者
    speed: number // 子弹速度
    direct: number // 方向
    pos: Position // 子弹位置
    sceneWidth: number;
    sceneHeight: number;
    died: boolean
    bulletSize: number
    timer: any

    constructor(owner: TankBase, speed: number, direct: number, sceenWidth: number, sceenHeight: number, pos: Position) {
        this.owner = owner
        this.speed = speed
        this.direct = direct
        this.sceneWidth = sceenWidth
        this.sceneHeight = sceenHeight
        this.died = false
        this.bulletSize = 3;
        this.pos = new Position(0, 0)
        this.pos.setX(pos.getX())
        this.pos.setY(pos.getY())

        this.timer = setInterval(() => {
            this.logicProcess();
        }, 66)
    }

    collisionCheck() {

        if (this.isDied()) {
            return
        }

        let x = this.pos.getX()
        let y = this.pos.getY()

        if (x <= 0 || y <=0) {
            this.died = true
            return;
        }

        if (x + this.bulletSize >= this.sceneWidth) {
            this.died = true
            return;
        }

        if (y + this.bulletSize >= this.sceneHeight) {
            this.died = true
            return;
        }
    }

    isDied(): boolean {
        return this.died
    }

    logicProcess() {
        switch(this.direct) {
            case DIRECT.UP:
                this.pos.setY(this.pos.getY() - this.speed)
                break;
            case DIRECT.DOWN:
                this.pos.setY(this.pos.getY() + this.speed)
                break;
            case DIRECT.LEFT:
                this.pos.setX(this.pos.getX() - this.speed)
                break;
            case DIRECT.RIGHT:
                this.pos.setX(this.pos.getX() + this.speed)
                break;
        }

        this.collisionCheck()

        if (this.died) {
            clearInterval(this.timer);
        }
    }
    
    draw(context: any) {
        if (this.died) {
            return
        }

        context.save()
        context.fillStyle = "#fff";
        context.beginPath();
        context.arc(this.pos.getX(), this.pos.getY() , this.bulletSize, 0, 2*Math.PI, true);       
        context.closePath();
        context.fill();
        context.restore();
    }

}