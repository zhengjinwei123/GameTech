import {TankBase} from "./tankBase"
import {Position, TankSize} from "./util"
import {TANKSIZE, CAMP} from "./consts"

const SPEED = 5
export class SmallTank extends TankBase {

    constructor(pos: Position, direction: number, camp: number, color: string, sceneWidth: number, sceneHeight: number) {
        const size = TankSize.createSize(TANKSIZE.SMALL)
        super(pos, direction, camp, size, color, SPEED, sceneWidth, sceneHeight)
    }
}

export class MediumTank extends TankBase {
    constructor(pos: Position, direction: number, camp: number, color: string, sceneWidth: number, sceneHeight: number) {
        const size = TankSize.createSize(TANKSIZE.MEDIUM)
        super(pos, direction, camp, size, color, SPEED, sceneWidth, sceneHeight)
    }
}

export class BigTank extends TankBase {
    constructor(pos: Position, direction: number, camp: number, color: string, sceneWidth: number, sceneHeight: number) {
        const size = TankSize.createSize(TANKSIZE.BIG)
        super(pos, direction, camp, size, color, SPEED, sceneWidth, sceneHeight)
    }
}

export class TankFactory {

    static createSmallBadTank(pos: Position, direction: number, sceneWidth: number, sceneHeight: number) {
        return new SmallTank(pos, direction, CAMP.BAD_TANK, "#f00", sceneWidth, sceneHeight)
    }
    static createSmallGoodTank(pos: Position, direction: number, sceneWidth: number, sceneHeight: number) {
        return new SmallTank(pos, direction, CAMP.GOOD_TANK, "#0f0", sceneWidth, sceneHeight)
    }
}

