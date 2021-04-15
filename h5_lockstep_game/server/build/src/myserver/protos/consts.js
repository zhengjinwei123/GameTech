"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAYER_STATUS = exports.GAME_STATUS = void 0;
// 游戏状态
exports.GAME_STATUS = {
    WAIT: 1,
    START: 2, // 开始了
};
exports.PLAYER_STATUS = {
    CONNECTED: 1,
    READY: 2,
    CLOSED: 3 // 关闭了 
};
