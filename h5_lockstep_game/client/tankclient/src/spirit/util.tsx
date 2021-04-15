import {TANKSIZE} from "./consts"

export class Position {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    getX(): number {
        return this.x
    }

    getY(): number {
        return this.y
    }

    setX(x: number) {
        this.x = x
    }

    setY(y: number) {
        this.y = y
    }
}

export class TankSize {
    width: number
    height: number

    static baseWidth: number = 20
    static baseHeigth: number = 60

    static createSize(size: number): TankSize {
        let x = 1
        if (size == TANKSIZE.BIG) {
            x = 3
        } else if (size == TANKSIZE.MEDIUM) {
            x = 2
        } else {
            x = 1
        }
        return new TankSize(this.baseWidth * x, this.baseHeigth * x)
    } 

    constructor(w: number, h: number) {
        this.width = w
        this.height = h
    }

    getWidth(): number {
        return this.width
    }

    getHeight(): number {
        return this.height
    }
}