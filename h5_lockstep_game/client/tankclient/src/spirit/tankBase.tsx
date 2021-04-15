import {Position, TankSize} from "./util"
import {DIRECT} from "./consts"
import Bullet from "./bullet"
import  Queue from "./queue"
import {FrameOp} from "../net/consts"


// 坦克基类
export class TankBase {

     pos: Position;
     oldPos: Position;
     direction: number;
     camp: number;
     size: TankSize;
     color: string;
     speed: number;
     sceneWidth: number;
     sceneHeight: number;
     posBulletBorn: Position; // 子弹出生位置
     bulletList: Queue

     bulletTimer: any
     drawing: boolean
   
    constructor(pos: Position, direction: number, camp: number, size: TankSize, color: string, speed: number, sceneWidth: number, sceneHeight: number) {
        this.pos = pos
        this.oldPos = pos
        this.direction = direction
        this.camp = camp
        this.size = size
        this.color = color
        this.speed = speed
        this.sceneWidth = sceneWidth
        this.sceneHeight = sceneHeight

        this.bulletList = new Queue()
       

        this.posBulletBorn = new Position(0, 0);

        this.drawing = false

        this.bulletTimer = setInterval(() => {
            this.logiscProcess()
        }, 66)
    }

    logiscProcess() {
        this.killBullets()
    }

    killBullets() {

        while (!this.bulletList.isEmpty()) {
            let bullet = this.bulletList.peek()

            if (bullet.isDied()) {
                console.log("delete bullet")
                this.bulletList.dequeue()
            } else {
                break;
            }
        }
    }

    fireBullet() {
        this.bulletList.enqueue(new Bullet(this, 20, this.direction, this.sceneWidth, this.sceneHeight,  this.posBulletBorn))
    }

    collisionCheck() {
        let x = this.pos.getX()
        let y = this.pos.getY()

        if (x <= 0) {
            x = 0
        }

        if (y <= 0) {
            y = 0
        }

        if (this.direction == DIRECT.UP || this.direction == DIRECT.DOWN) {
            if (x + 70 + 20 >= this.sceneWidth) {
                x = this.sceneWidth - 70 - 20
            }
            if (y + 65 >= this.sceneHeight) {
                y = this.sceneHeight - 65
            }
        }
        if (this.direction == DIRECT.LEFT || this.direction == DIRECT.RIGHT) {
            if (y + 70 + 20 >= this.sceneHeight) {
                y = this.sceneHeight - 70 - 20
            }
            if (x + 65 >= this.sceneWidth) {
                x = this.sceneWidth - 65
            }
        }

        this.pos.setX(x)
        this.pos.setY(y)
    }

  
    setBulletBornPos(x: number, y:number) {
        this.posBulletBorn.setX(x);
        this.posBulletBorn.setY(y);
    }

    recvOp(op: number, dt: number) {
        let oldDirection = this.direction
        switch (op) {
            case FrameOp.MOVE_UP:
                this.up()

                if (oldDirection == this.direction) {
                    this.moveUp(dt)
                }
                
                break;
            case FrameOp.MOVE_DOWN:
                this.down()
                if (oldDirection == this.direction) {
                    this.moveDown(dt)
                }
                break;
            case FrameOp.MOVE_LEFT:
                this.left()
                if (oldDirection == this.direction) {
                    this.moveLeft(dt)
                }
                break;
            case FrameOp.MOVE_RIGHT:
                this.right()
                if (oldDirection == this.direction) {
                    this.moveRight(dt)
                }
                break;
            case FrameOp.FIRE_BULLET:
                this.fireBullet()
                break;
            default:
                break;
        }
    }

    up() {
        this.direction = DIRECT.UP
    }

    down() {
        this.direction = DIRECT.DOWN
    }

    left() {
        this.direction = DIRECT.LEFT
    }

    right() {
        this.direction = DIRECT.RIGHT
    }

    move(dt: number) {
        const distance = dt * this.speed
        switch(this.direction) {
            case DIRECT.UP:
                this.moveUp(distance)
                break;
            case DIRECT.DOWN:
                this.moveDown(distance)
                break;
            case DIRECT.LEFT:
                this.moveLeft(distance)
                break;
            case DIRECT.RIGHT:
                this.moveRight(distance)
                break;
        }
    }

    setBornPosAndDirection(x: number, y: number) {
        this.pos.setX(x)
        this.pos.setY(y)
        this.direction = DIRECT.UP
    }

    moveUp(distance: number) {
        this.pos.setY(this.pos.getY() - distance)
        this.collisionCheck()

        this.setBulletBornPos(this.pos.getX()+45, this.pos.getY()-25)
    }

    moveDown(distance: number) {
        this.pos.setY(this.pos.getY() + distance)
        this.collisionCheck()
        this.setBulletBornPos(this.pos.getX()+45, this.pos.getY()+95)
    }

     moveLeft(distance: number) {
        this.pos.setX(this.pos.getX() - distance)
        this.collisionCheck()
        this.setBulletBornPos(this.pos.getX()-25, this.pos.getY()+45)
    }

    moveRight(distance: number) {
        this.pos.setX(this.pos.getX() + distance)
        this.collisionCheck()
        this.setBulletBornPos(this.pos.getX()+95, this.pos.getY()+45)
    }

    drawBullets(context: any) {
        let bullets = this.bulletList.peekall();
        if (bullets.length) {
            bullets.forEach(element => {
                element.draw(context);
            });
        }
    }

    draw(context: any) {
        switch(this.direction) {
            case DIRECT.UP:
                this.drawTop(context)
                break;
            case DIRECT.DOWN:
                this.drawDown(context)
                break;
            case DIRECT.LEFT:
                this.drawLeft(context)
                break;
            case DIRECT.RIGHT:
                this.drawRight(context)
                break;
            default:
                break;
        }

        this.drawBullets(context);
    }

    drawTop(context: any) {
        context.save()
        context.fillStyle = "#542174";
        context.fillRect(this.pos.getX(), this.pos.getY(), 20, 65);                
        context.fillRect(this.pos.getX()+70, this.pos.getY(), 20, 65);                
        context.fillRect(this.pos.getX() + 23, this.pos.getY()+10, 44,50);    

        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.pos.getX()+45,this.pos.getY()+35,16,0,2*Math.PI,false);       
        context.closePath();
        context.fill();
        context.strokeStyle = this.color;
        context.lineWidth = "8.0";
        context.moveTo(this.pos.getX()+45, this.pos.getY()+35);              //炮筒起点            
        context.lineTo(this.pos.getX()+45, this.pos.getY()-25);        //炮筒终点
        context.stroke();                                //画炮筒
        context.restore();
    }

    drawDown(context: any) {
        context.save()
        context.fillStyle = "#542174";
        context.fillRect(this.pos.getX(), this.pos.getY(), 20, 65);                
        context.fillRect(this.pos.getX()+70, this.pos.getY(), 20, 65);                
        context.fillRect(this.pos.getX() + 23, this.pos.getY()+10, 44,50);    

        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.pos.getX()+45,this.pos.getY()+35,16,0,2*Math.PI,false);       
        context.closePath();
        context.fill();
        context.strokeStyle = this.color;
        context.lineWidth = "8.0";
        context.moveTo(this.pos.getX()+45, this.pos.getY()+35);              //炮筒起点            
        context.lineTo(this.pos.getX()+45, this.pos.getY()+95);        //炮筒终点
        context.stroke();                                //画炮筒
        context.restore();
    }

    drawLeft(context: any) {
        context.save()
        context.fillStyle = "#542174";
        context.fillRect(this.pos.getX(), this.pos.getY(), 65, 20);                
        context.fillRect(this.pos.getX(), this.pos.getY() + 70, 65, 20);                
        context.fillRect(this.pos.getX() + 10, this.pos.getY()+23, 50,44);    

        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.pos.getX()+35,this.pos.getY()+45,16,0,2*Math.PI,false);       
        context.closePath();
        context.fill();
        context.strokeStyle = this.color;
        context.lineWidth = "8.0";
        context.moveTo(this.pos.getX()+35, this.pos.getY()+45);              //炮筒起点            
        context.lineTo(this.pos.getX()-25, this.pos.getY()+45);        //炮筒终点
        context.stroke();                                //画炮筒
        context.restore();
    }

    drawRight(context: any) {
        context.save()
        context.fillStyle = "#542174";
        context.fillRect(this.pos.getX(), this.pos.getY(), 65, 20);                
        context.fillRect(this.pos.getX(), this.pos.getY() + 70, 65, 20);                
        context.fillRect(this.pos.getX() + 10, this.pos.getY()+23, 50,44);    

        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.pos.getX()+35,this.pos.getY()+45,16,0,2*Math.PI,false);       
        context.closePath();
        context.fill();
        context.strokeStyle = this.color;
        context.lineWidth = "8.0";
        context.moveTo(this.pos.getX()+35, this.pos.getY()+45);              //炮筒起点            
        context.lineTo(this.pos.getX()+95, this.pos.getY()+45);        //炮筒终点
        context.stroke();                                //画炮筒
        context.restore();
    }

}