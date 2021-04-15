export const enum RET {
  ERROR = "ERROR",
  OK = "OK",
  PASSWORD_ERROR = "PASSWORD_ERROR",
  ACCOUNT_NOT_EXISTS = "ACCOUNT_NOT_EXISTS",
  USER_HAS_LOGIN = "USER_HAS_LOGIN",
}

export const encodeRET: { [key: string]: number } = {
  ERROR: 0,
  OK: 1,
  PASSWORD_ERROR: 2,
  ACCOUNT_NOT_EXISTS: 3,
  USER_HAS_LOGIN: 4,
};

export const decodeRET: { [key: number]: RET } = {
  0: RET.ERROR,
  1: RET.OK,
  2: RET.PASSWORD_ERROR,
  3: RET.ACCOUNT_NOT_EXISTS,
  4: RET.USER_HAS_LOGIN,
};

export const enum MSGID {
  ID_S2C_ASK_RESPONSE = "ID_S2C_ASK_RESPONSE",
  ID_C2S_LOGIN_REQUEST = "ID_C2S_LOGIN_REQUEST",
  ID_S2C_LOGIN_RESPONSE = "ID_S2C_LOGIN_RESPONSE",
  ID_C2S_FRAMESYNC_REQUEST = "ID_C2S_FRAMESYNC_REQUEST",
  ID_S2C_FRAMESYNC_RESPONSE = "ID_S2C_FRAMESYNC_RESPONSE",
  ID_S2C_PLAYER_ENTER_RESPONSE = "ID_S2C_PLAYER_ENTER_RESPONSE",
  ID_S2C_PLAYER_LEAVE_RESPONSE = "ID_S2C_PLAYER_LEAVE_RESPONSE",
}

export const encodeMSGID: { [key: string]: number } = {
  ID_S2C_ASK_RESPONSE: 10001,
  ID_C2S_LOGIN_REQUEST: 11001,
  ID_S2C_LOGIN_RESPONSE: 11002,
  ID_C2S_FRAMESYNC_REQUEST: 11003,
  ID_S2C_FRAMESYNC_RESPONSE: 11004,
  ID_S2C_PLAYER_ENTER_RESPONSE: 11005,
  ID_S2C_PLAYER_LEAVE_RESPONSE: 11006,
};

export const decodeMSGID: { [key: number]: MSGID } = {
  10001: MSGID.ID_S2C_ASK_RESPONSE,
  11001: MSGID.ID_C2S_LOGIN_REQUEST,
  11002: MSGID.ID_S2C_LOGIN_RESPONSE,
  11003: MSGID.ID_C2S_FRAMESYNC_REQUEST,
  11004: MSGID.ID_S2C_FRAMESYNC_RESPONSE,
  11005: MSGID.ID_S2C_PLAYER_ENTER_RESPONSE,
  11006: MSGID.ID_S2C_PLAYER_LEAVE_RESPONSE,
};

export interface FrameMsg {
  op?: number;
  step?: number;
  clientId?: number;
}

export function encodeFrameMsg(message: FrameMsg): Uint8Array {
  let bb = popByteBuffer();
  _encodeFrameMsg(message, bb);
  return toUint8Array(bb);
}

function _encodeFrameMsg(message: FrameMsg, bb: ByteBuffer): void {
  // optional uint32 op = 1;
  let $op = message.op;
  if ($op !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, $op);
  }

  // optional uint32 step = 2;
  let $step = message.step;
  if ($step !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, $step);
  }

  // optional uint32 clientId = 3;
  let $clientId = message.clientId;
  if ($clientId !== undefined) {
    writeVarint32(bb, 24);
    writeVarint32(bb, $clientId);
  }
}

export function decodeFrameMsg(binary: Uint8Array): FrameMsg {
  return _decodeFrameMsg(wrapByteBuffer(binary));
}

function _decodeFrameMsg(bb: ByteBuffer): FrameMsg {
  let message: FrameMsg = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional uint32 op = 1;
      case 1: {
        message.op = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 step = 2;
      case 2: {
        message.step = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 clientId = 3;
      case 3: {
        message.clientId = readVarint32(bb) >>> 0;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface FrameMsgList {
  frame?: FrameMsg[];
}

export function encodeFrameMsgList(message: FrameMsgList): Uint8Array {
  let bb = popByteBuffer();
  _encodeFrameMsgList(message, bb);
  return toUint8Array(bb);
}

function _encodeFrameMsgList(message: FrameMsgList, bb: ByteBuffer): void {
  // repeated FrameMsg frame = 1;
  let array$frame = message.frame;
  if (array$frame !== undefined) {
    for (let value of array$frame) {
      writeVarint32(bb, 10);
      let nested = popByteBuffer();
      _encodeFrameMsg(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }
}

export function decodeFrameMsgList(binary: Uint8Array): FrameMsgList {
  return _decodeFrameMsgList(wrapByteBuffer(binary));
}

function _decodeFrameMsgList(bb: ByteBuffer): FrameMsgList {
  let message: FrameMsgList = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // repeated FrameMsg frame = 1;
      case 1: {
        let limit = pushTemporaryLength(bb);
        let values = message.frame || (message.frame = []);
        values.push(_decodeFrameMsg(bb));
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface S2C_Ask_Response {
  msgid?: MSGID;
  askid?: number;
  errorcode?: number;
}

export function encodeS2C_Ask_Response(message: S2C_Ask_Response): Uint8Array {
  let bb = popByteBuffer();
  _encodeS2C_Ask_Response(message, bb);
  return toUint8Array(bb);
}

function _encodeS2C_Ask_Response(message: S2C_Ask_Response, bb: ByteBuffer): void {
  // optional MSGID msgid = 1;
  let $msgid = message.msgid;
  if ($msgid !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, encodeMSGID[$msgid]);
  }

  // optional int32 askid = 2;
  let $askid = message.askid;
  if ($askid !== undefined) {
    writeVarint32(bb, 16);
    writeVarint64(bb, intToLong($askid));
  }

  // optional int32 errorcode = 3;
  let $errorcode = message.errorcode;
  if ($errorcode !== undefined) {
    writeVarint32(bb, 24);
    writeVarint64(bb, intToLong($errorcode));
  }
}

export function decodeS2C_Ask_Response(binary: Uint8Array): S2C_Ask_Response {
  return _decodeS2C_Ask_Response(wrapByteBuffer(binary));
}

function _decodeS2C_Ask_Response(bb: ByteBuffer): S2C_Ask_Response {
  let message: S2C_Ask_Response = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional MSGID msgid = 1;
      case 1: {
        message.msgid = decodeMSGID[readVarint32(bb)];
        break;
      }

      // optional int32 askid = 2;
      case 2: {
        message.askid = readVarint32(bb);
        break;
      }

      // optional int32 errorcode = 3;
      case 3: {
        message.errorcode = readVarint32(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface C2S_Login_Request {
  msgid?: MSGID;
  account?: string;
  password?: string;
}

export function encodeC2S_Login_Request(message: C2S_Login_Request): Uint8Array {
  let bb = popByteBuffer();
  _encodeC2S_Login_Request(message, bb);
  return toUint8Array(bb);
}

function _encodeC2S_Login_Request(message: C2S_Login_Request, bb: ByteBuffer): void {
  // optional MSGID msgid = 1;
  let $msgid = message.msgid;
  if ($msgid !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, encodeMSGID[$msgid]);
  }

  // optional string account = 2;
  let $account = message.account;
  if ($account !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $account);
  }

  // optional string password = 3;
  let $password = message.password;
  if ($password !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $password);
  }
}

export function decodeC2S_Login_Request(binary: Uint8Array): C2S_Login_Request {
  return _decodeC2S_Login_Request(wrapByteBuffer(binary));
}

function _decodeC2S_Login_Request(bb: ByteBuffer): C2S_Login_Request {
  let message: C2S_Login_Request = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional MSGID msgid = 1;
      case 1: {
        message.msgid = decodeMSGID[readVarint32(bb)];
        break;
      }

      // optional string account = 2;
      case 2: {
        message.account = readString(bb, readVarint32(bb));
        break;
      }

      // optional string password = 3;
      case 3: {
        message.password = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface S2C_Login_Response {
  msgid?: MSGID;
  ret?: number;
  timestamp?: number;
  frameInterval?: number;
  clientId?: number;
  clients?: number[];
  frames?: FrameMsgList[];
}

export function encodeS2C_Login_Response(message: S2C_Login_Response): Uint8Array {
  let bb = popByteBuffer();
  _encodeS2C_Login_Response(message, bb);
  return toUint8Array(bb);
}

function _encodeS2C_Login_Response(message: S2C_Login_Response, bb: ByteBuffer): void {
  // optional MSGID msgid = 1;
  let $msgid = message.msgid;
  if ($msgid !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, encodeMSGID[$msgid]);
  }

  // optional uint32 ret = 2;
  let $ret = message.ret;
  if ($ret !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, $ret);
  }

  // optional uint32 timestamp = 3;
  let $timestamp = message.timestamp;
  if ($timestamp !== undefined) {
    writeVarint32(bb, 24);
    writeVarint32(bb, $timestamp);
  }

  // optional uint32 frameInterval = 4;
  let $frameInterval = message.frameInterval;
  if ($frameInterval !== undefined) {
    writeVarint32(bb, 32);
    writeVarint32(bb, $frameInterval);
  }

  // optional uint32 clientId = 5;
  let $clientId = message.clientId;
  if ($clientId !== undefined) {
    writeVarint32(bb, 40);
    writeVarint32(bb, $clientId);
  }

  // repeated uint32 clients = 6;
  let array$clients = message.clients;
  if (array$clients !== undefined) {
    let packed = popByteBuffer();
    for (let value of array$clients) {
      writeVarint32(packed, value);
    }
    writeVarint32(bb, 50);
    writeVarint32(bb, packed.offset);
    writeByteBuffer(bb, packed);
    pushByteBuffer(packed);
  }

  // repeated FrameMsgList frames = 7;
  let array$frames = message.frames;
  if (array$frames !== undefined) {
    for (let value of array$frames) {
      writeVarint32(bb, 58);
      let nested = popByteBuffer();
      _encodeFrameMsgList(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }
}

export function decodeS2C_Login_Response(binary: Uint8Array): S2C_Login_Response {
  return _decodeS2C_Login_Response(wrapByteBuffer(binary));
}

function _decodeS2C_Login_Response(bb: ByteBuffer): S2C_Login_Response {
  let message: S2C_Login_Response = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional MSGID msgid = 1;
      case 1: {
        message.msgid = decodeMSGID[readVarint32(bb)];
        break;
      }

      // optional uint32 ret = 2;
      case 2: {
        message.ret = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 timestamp = 3;
      case 3: {
        message.timestamp = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 frameInterval = 4;
      case 4: {
        message.frameInterval = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 clientId = 5;
      case 5: {
        message.clientId = readVarint32(bb) >>> 0;
        break;
      }

      // repeated uint32 clients = 6;
      case 6: {
        let values = message.clients || (message.clients = []);
        if ((tag & 7) === 2) {
          let outerLimit = pushTemporaryLength(bb);
          while (!isAtEnd(bb)) {
            values.push(readVarint32(bb) >>> 0);
          }
          bb.limit = outerLimit;
        } else {
          values.push(readVarint32(bb) >>> 0);
        }
        break;
      }

      // repeated FrameMsgList frames = 7;
      case 7: {
        let limit = pushTemporaryLength(bb);
        let values = message.frames || (message.frames = []);
        values.push(_decodeFrameMsgList(bb));
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface C2S_FrameSync_Request {
  msgid?: MSGID;
  op?: number;
}

export function encodeC2S_FrameSync_Request(message: C2S_FrameSync_Request): Uint8Array {
  let bb = popByteBuffer();
  _encodeC2S_FrameSync_Request(message, bb);
  return toUint8Array(bb);
}

function _encodeC2S_FrameSync_Request(message: C2S_FrameSync_Request, bb: ByteBuffer): void {
  // optional MSGID msgid = 1;
  let $msgid = message.msgid;
  if ($msgid !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, encodeMSGID[$msgid]);
  }

  // optional uint32 op = 2;
  let $op = message.op;
  if ($op !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, $op);
  }
}

export function decodeC2S_FrameSync_Request(binary: Uint8Array): C2S_FrameSync_Request {
  return _decodeC2S_FrameSync_Request(wrapByteBuffer(binary));
}

function _decodeC2S_FrameSync_Request(bb: ByteBuffer): C2S_FrameSync_Request {
  let message: C2S_FrameSync_Request = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional MSGID msgid = 1;
      case 1: {
        message.msgid = decodeMSGID[readVarint32(bb)];
        break;
      }

      // optional uint32 op = 2;
      case 2: {
        message.op = readVarint32(bb) >>> 0;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface S2C_FrameSync_Response {
  msgid?: MSGID;
  ret?: number;
  frames?: FrameMsg[];
}

export function encodeS2C_FrameSync_Response(message: S2C_FrameSync_Response): Uint8Array {
  let bb = popByteBuffer();
  _encodeS2C_FrameSync_Response(message, bb);
  return toUint8Array(bb);
}

function _encodeS2C_FrameSync_Response(message: S2C_FrameSync_Response, bb: ByteBuffer): void {
  // optional MSGID msgid = 1;
  let $msgid = message.msgid;
  if ($msgid !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, encodeMSGID[$msgid]);
  }

  // optional uint32 ret = 2;
  let $ret = message.ret;
  if ($ret !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, $ret);
  }

  // repeated FrameMsg frames = 3;
  let array$frames = message.frames;
  if (array$frames !== undefined) {
    for (let value of array$frames) {
      writeVarint32(bb, 26);
      let nested = popByteBuffer();
      _encodeFrameMsg(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }
}

export function decodeS2C_FrameSync_Response(binary: Uint8Array): S2C_FrameSync_Response {
  return _decodeS2C_FrameSync_Response(wrapByteBuffer(binary));
}

function _decodeS2C_FrameSync_Response(bb: ByteBuffer): S2C_FrameSync_Response {
  let message: S2C_FrameSync_Response = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional MSGID msgid = 1;
      case 1: {
        message.msgid = decodeMSGID[readVarint32(bb)];
        break;
      }

      // optional uint32 ret = 2;
      case 2: {
        message.ret = readVarint32(bb) >>> 0;
        break;
      }

      // repeated FrameMsg frames = 3;
      case 3: {
        let limit = pushTemporaryLength(bb);
        let values = message.frames || (message.frames = []);
        values.push(_decodeFrameMsg(bb));
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface S2C_PlayerEnter_Response {
  msgid?: MSGID;
  ret?: number;
  clientId?: number;
}

export function encodeS2C_PlayerEnter_Response(message: S2C_PlayerEnter_Response): Uint8Array {
  let bb = popByteBuffer();
  _encodeS2C_PlayerEnter_Response(message, bb);
  return toUint8Array(bb);
}

function _encodeS2C_PlayerEnter_Response(message: S2C_PlayerEnter_Response, bb: ByteBuffer): void {
  // optional MSGID msgid = 1;
  let $msgid = message.msgid;
  if ($msgid !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, encodeMSGID[$msgid]);
  }

  // optional uint32 ret = 2;
  let $ret = message.ret;
  if ($ret !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, $ret);
  }

  // optional uint32 clientId = 3;
  let $clientId = message.clientId;
  if ($clientId !== undefined) {
    writeVarint32(bb, 24);
    writeVarint32(bb, $clientId);
  }
}

export function decodeS2C_PlayerEnter_Response(binary: Uint8Array): S2C_PlayerEnter_Response {
  return _decodeS2C_PlayerEnter_Response(wrapByteBuffer(binary));
}

function _decodeS2C_PlayerEnter_Response(bb: ByteBuffer): S2C_PlayerEnter_Response {
  let message: S2C_PlayerEnter_Response = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional MSGID msgid = 1;
      case 1: {
        message.msgid = decodeMSGID[readVarint32(bb)];
        break;
      }

      // optional uint32 ret = 2;
      case 2: {
        message.ret = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 clientId = 3;
      case 3: {
        message.clientId = readVarint32(bb) >>> 0;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface S2C_PlayerLeave_Response {
  msgid?: MSGID;
  ret?: number;
  clientId?: number;
}

export function encodeS2C_PlayerLeave_Response(message: S2C_PlayerLeave_Response): Uint8Array {
  let bb = popByteBuffer();
  _encodeS2C_PlayerLeave_Response(message, bb);
  return toUint8Array(bb);
}

function _encodeS2C_PlayerLeave_Response(message: S2C_PlayerLeave_Response, bb: ByteBuffer): void {
  // optional MSGID msgid = 1;
  let $msgid = message.msgid;
  if ($msgid !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, encodeMSGID[$msgid]);
  }

  // optional uint32 ret = 2;
  let $ret = message.ret;
  if ($ret !== undefined) {
    writeVarint32(bb, 16);
    writeVarint32(bb, $ret);
  }

  // optional uint32 clientId = 3;
  let $clientId = message.clientId;
  if ($clientId !== undefined) {
    writeVarint32(bb, 24);
    writeVarint32(bb, $clientId);
  }
}

export function decodeS2C_PlayerLeave_Response(binary: Uint8Array): S2C_PlayerLeave_Response {
  return _decodeS2C_PlayerLeave_Response(wrapByteBuffer(binary));
}

function _decodeS2C_PlayerLeave_Response(bb: ByteBuffer): S2C_PlayerLeave_Response {
  let message: S2C_PlayerLeave_Response = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional MSGID msgid = 1;
      case 1: {
        message.msgid = decodeMSGID[readVarint32(bb)];
        break;
      }

      // optional uint32 ret = 2;
      case 2: {
        message.ret = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint32 clientId = 3;
      case 3: {
        message.clientId = readVarint32(bb) >>> 0;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface Long {
  low: number;
  high: number;
  unsigned: boolean;
}

interface ByteBuffer {
  bytes: Uint8Array;
  offset: number;
  limit: number;
}

function pushTemporaryLength(bb: ByteBuffer): number {
  let length = readVarint32(bb);
  let limit = bb.limit;
  bb.limit = bb.offset + length;
  return limit;
}

function skipUnknownField(bb: ByteBuffer, type: number): void {
  switch (type) {
    case 0: while (readByte(bb) & 0x80) { } break;
    case 2: skip(bb, readVarint32(bb)); break;
    case 5: skip(bb, 4); break;
    case 1: skip(bb, 8); break;
    default: throw new Error("Unimplemented type: " + type);
  }
}

function stringToLong(value: string): Long {
  return {
    low: value.charCodeAt(0) | (value.charCodeAt(1) << 16),
    high: value.charCodeAt(2) | (value.charCodeAt(3) << 16),
    unsigned: false,
  };
}

function longToString(value: Long): string {
  let low = value.low;
  let high = value.high;
  return String.fromCharCode(
    low & 0xFFFF,
    low >>> 16,
    high & 0xFFFF,
    high >>> 16);
}

// The code below was modified from https://github.com/protobufjs/bytebuffer.js
// which is under the Apache License 2.0.

let f32 = new Float32Array(1);
let f32_u8 = new Uint8Array(f32.buffer);

let f64 = new Float64Array(1);
let f64_u8 = new Uint8Array(f64.buffer);

function intToLong(value: number): Long {
  value |= 0;
  return {
    low: value,
    high: value >> 31,
    unsigned: value >= 0,
  };
}

let bbStack: ByteBuffer[] = [];

function popByteBuffer(): ByteBuffer {
  const bb = bbStack.pop();
  if (!bb) return { bytes: new Uint8Array(64), offset: 0, limit: 0 };
  bb.offset = bb.limit = 0;
  return bb;
}

function pushByteBuffer(bb: ByteBuffer): void {
  bbStack.push(bb);
}

function wrapByteBuffer(bytes: Uint8Array): ByteBuffer {
  return { bytes, offset: 0, limit: bytes.length };
}

function toUint8Array(bb: ByteBuffer): Uint8Array {
  let bytes = bb.bytes;
  let limit = bb.limit;
  return bytes.length === limit ? bytes : bytes.subarray(0, limit);
}

function skip(bb: ByteBuffer, offset: number): void {
  if (bb.offset + offset > bb.limit) {
    throw new Error('Skip past limit');
  }
  bb.offset += offset;
}

function isAtEnd(bb: ByteBuffer): boolean {
  return bb.offset >= bb.limit;
}

function grow(bb: ByteBuffer, count: number): number {
  let bytes = bb.bytes;
  let offset = bb.offset;
  let limit = bb.limit;
  let finalOffset = offset + count;
  if (finalOffset > bytes.length) {
    let newBytes = new Uint8Array(finalOffset * 2);
    newBytes.set(bytes);
    bb.bytes = newBytes;
  }
  bb.offset = finalOffset;
  if (finalOffset > limit) {
    bb.limit = finalOffset;
  }
  return offset;
}

function advance(bb: ByteBuffer, count: number): number {
  let offset = bb.offset;
  if (offset + count > bb.limit) {
    throw new Error('Read past limit');
  }
  bb.offset += count;
  return offset;
}

function readBytes(bb: ByteBuffer, count: number): Uint8Array {
  let offset = advance(bb, count);
  return bb.bytes.subarray(offset, offset + count);
}

function writeBytes(bb: ByteBuffer, buffer: Uint8Array): void {
  let offset = grow(bb, buffer.length);
  bb.bytes.set(buffer, offset);
}

function readString(bb: ByteBuffer, count: number): string {
  // Sadly a hand-coded UTF8 decoder is much faster than subarray+TextDecoder in V8
  let offset = advance(bb, count);
  let fromCharCode = String.fromCharCode;
  let bytes = bb.bytes;
  let invalid = '\uFFFD';
  let text = '';

  for (let i = 0; i < count; i++) {
    let c1 = bytes[i + offset], c2: number, c3: number, c4: number, c: number;

    // 1 byte
    if ((c1 & 0x80) === 0) {
      text += fromCharCode(c1);
    }

    // 2 bytes
    else if ((c1 & 0xE0) === 0xC0) {
      if (i + 1 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        if ((c2 & 0xC0) !== 0x80) text += invalid;
        else {
          c = ((c1 & 0x1F) << 6) | (c2 & 0x3F);
          if (c < 0x80) text += invalid;
          else {
            text += fromCharCode(c);
            i++;
          }
        }
      }
    }

    // 3 bytes
    else if ((c1 & 0xF0) == 0xE0) {
      if (i + 2 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        if (((c2 | (c3 << 8)) & 0xC0C0) !== 0x8080) text += invalid;
        else {
          c = ((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
          if (c < 0x0800 || (c >= 0xD800 && c <= 0xDFFF)) text += invalid;
          else {
            text += fromCharCode(c);
            i += 2;
          }
        }
      }
    }

    // 4 bytes
    else if ((c1 & 0xF8) == 0xF0) {
      if (i + 3 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        c4 = bytes[i + offset + 3];
        if (((c2 | (c3 << 8) | (c4 << 16)) & 0xC0C0C0) !== 0x808080) text += invalid;
        else {
          c = ((c1 & 0x07) << 0x12) | ((c2 & 0x3F) << 0x0C) | ((c3 & 0x3F) << 0x06) | (c4 & 0x3F);
          if (c < 0x10000 || c > 0x10FFFF) text += invalid;
          else {
            c -= 0x10000;
            text += fromCharCode((c >> 10) + 0xD800, (c & 0x3FF) + 0xDC00);
            i += 3;
          }
        }
      }
    }

    else text += invalid;
  }

  return text;
}

function writeString(bb: ByteBuffer, text: string): void {
  // Sadly a hand-coded UTF8 encoder is much faster than TextEncoder+set in V8
  let n = text.length;
  let byteCount = 0;

  // Write the byte count first
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    byteCount += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }
  writeVarint32(bb, byteCount);

  let offset = grow(bb, byteCount);
  let bytes = bb.bytes;

  // Then write the bytes
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    if (c < 0x80) {
      bytes[offset++] = c;
    } else {
      if (c < 0x800) {
        bytes[offset++] = ((c >> 6) & 0x1F) | 0xC0;
      } else {
        if (c < 0x10000) {
          bytes[offset++] = ((c >> 12) & 0x0F) | 0xE0;
        } else {
          bytes[offset++] = ((c >> 18) & 0x07) | 0xF0;
          bytes[offset++] = ((c >> 12) & 0x3F) | 0x80;
        }
        bytes[offset++] = ((c >> 6) & 0x3F) | 0x80;
      }
      bytes[offset++] = (c & 0x3F) | 0x80;
    }
  }
}

function writeByteBuffer(bb: ByteBuffer, buffer: ByteBuffer): void {
  let offset = grow(bb, buffer.limit);
  let from = bb.bytes;
  let to = buffer.bytes;

  // This for loop is much faster than subarray+set on V8
  for (let i = 0, n = buffer.limit; i < n; i++) {
    from[i + offset] = to[i];
  }
}

function readByte(bb: ByteBuffer): number {
  return bb.bytes[advance(bb, 1)];
}

function writeByte(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 1);
  bb.bytes[offset] = value;
}

function readFloat(bb: ByteBuffer): number {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f32_u8[0] = bytes[offset++];
  f32_u8[1] = bytes[offset++];
  f32_u8[2] = bytes[offset++];
  f32_u8[3] = bytes[offset++];
  return f32[0];
}

function writeFloat(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  f32[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f32_u8[0];
  bytes[offset++] = f32_u8[1];
  bytes[offset++] = f32_u8[2];
  bytes[offset++] = f32_u8[3];
}

function readDouble(bb: ByteBuffer): number {
  let offset = advance(bb, 8);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f64_u8[0] = bytes[offset++];
  f64_u8[1] = bytes[offset++];
  f64_u8[2] = bytes[offset++];
  f64_u8[3] = bytes[offset++];
  f64_u8[4] = bytes[offset++];
  f64_u8[5] = bytes[offset++];
  f64_u8[6] = bytes[offset++];
  f64_u8[7] = bytes[offset++];
  return f64[0];
}

function writeDouble(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 8);
  let bytes = bb.bytes;
  f64[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f64_u8[0];
  bytes[offset++] = f64_u8[1];
  bytes[offset++] = f64_u8[2];
  bytes[offset++] = f64_u8[3];
  bytes[offset++] = f64_u8[4];
  bytes[offset++] = f64_u8[5];
  bytes[offset++] = f64_u8[6];
  bytes[offset++] = f64_u8[7];
}

function readInt32(bb: ByteBuffer): number {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  );
}

function writeInt32(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  bytes[offset] = value;
  bytes[offset + 1] = value >> 8;
  bytes[offset + 2] = value >> 16;
  bytes[offset + 3] = value >> 24;
}

function readInt64(bb: ByteBuffer, unsigned: boolean): Long {
  return {
    low: readInt32(bb),
    high: readInt32(bb),
    unsigned,
  };
}

function writeInt64(bb: ByteBuffer, value: Long): void {
  writeInt32(bb, value.low);
  writeInt32(bb, value.high);
}

function readVarint32(bb: ByteBuffer): number {
  let c = 0;
  let value = 0;
  let b: number;
  do {
    b = readByte(bb);
    if (c < 32) value |= (b & 0x7F) << c;
    c += 7;
  } while (b & 0x80);
  return value;
}

function writeVarint32(bb: ByteBuffer, value: number): void {
  value >>>= 0;
  while (value >= 0x80) {
    writeByte(bb, (value & 0x7f) | 0x80);
    value >>>= 7;
  }
  writeByte(bb, value);
}

function readVarint64(bb: ByteBuffer, unsigned: boolean): Long {
  let part0 = 0;
  let part1 = 0;
  let part2 = 0;
  let b: number;

  b = readByte(bb); part0 = (b & 0x7F); if (b & 0x80) {
    b = readByte(bb); part0 |= (b & 0x7F) << 7; if (b & 0x80) {
      b = readByte(bb); part0 |= (b & 0x7F) << 14; if (b & 0x80) {
        b = readByte(bb); part0 |= (b & 0x7F) << 21; if (b & 0x80) {

          b = readByte(bb); part1 = (b & 0x7F); if (b & 0x80) {
            b = readByte(bb); part1 |= (b & 0x7F) << 7; if (b & 0x80) {
              b = readByte(bb); part1 |= (b & 0x7F) << 14; if (b & 0x80) {
                b = readByte(bb); part1 |= (b & 0x7F) << 21; if (b & 0x80) {

                  b = readByte(bb); part2 = (b & 0x7F); if (b & 0x80) {
                    b = readByte(bb); part2 |= (b & 0x7F) << 7;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    low: part0 | (part1 << 28),
    high: (part1 >>> 4) | (part2 << 24),
    unsigned,
  };
}

function writeVarint64(bb: ByteBuffer, value: Long): void {
  let part0 = value.low >>> 0;
  let part1 = ((value.low >>> 28) | (value.high << 4)) >>> 0;
  let part2 = value.high >>> 24;

  // ref: src/google/protobuf/io/coded_stream.cc
  let size =
    part2 === 0 ?
      part1 === 0 ?
        part0 < 1 << 14 ?
          part0 < 1 << 7 ? 1 : 2 :
          part0 < 1 << 21 ? 3 : 4 :
        part1 < 1 << 14 ?
          part1 < 1 << 7 ? 5 : 6 :
          part1 < 1 << 21 ? 7 : 8 :
      part2 < 1 << 7 ? 9 : 10;

  let offset = grow(bb, size);
  let bytes = bb.bytes;

  switch (size) {
    case 10: bytes[offset + 9] = (part2 >>> 7) & 0x01;
    case 9: bytes[offset + 8] = size !== 9 ? part2 | 0x80 : part2 & 0x7F;
    case 8: bytes[offset + 7] = size !== 8 ? (part1 >>> 21) | 0x80 : (part1 >>> 21) & 0x7F;
    case 7: bytes[offset + 6] = size !== 7 ? (part1 >>> 14) | 0x80 : (part1 >>> 14) & 0x7F;
    case 6: bytes[offset + 5] = size !== 6 ? (part1 >>> 7) | 0x80 : (part1 >>> 7) & 0x7F;
    case 5: bytes[offset + 4] = size !== 5 ? part1 | 0x80 : part1 & 0x7F;
    case 4: bytes[offset + 3] = size !== 4 ? (part0 >>> 21) | 0x80 : (part0 >>> 21) & 0x7F;
    case 3: bytes[offset + 2] = size !== 3 ? (part0 >>> 14) | 0x80 : (part0 >>> 14) & 0x7F;
    case 2: bytes[offset + 1] = size !== 2 ? (part0 >>> 7) | 0x80 : (part0 >>> 7) & 0x7F;
    case 1: bytes[offset] = size !== 1 ? part0 | 0x80 : part0 & 0x7F;
  }
}

function readVarint32ZigZag(bb: ByteBuffer): number {
  let value = readVarint32(bb);

  // ref: src/google/protobuf/wire_format_lite.h
  return (value >>> 1) ^ -(value & 1);
}

function writeVarint32ZigZag(bb: ByteBuffer, value: number): void {
  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint32(bb, (value << 1) ^ (value >> 31));
}

function readVarint64ZigZag(bb: ByteBuffer): Long {
  let value = readVarint64(bb, /* unsigned */ false);
  let low = value.low;
  let high = value.high;
  let flip = -(low & 1);

  // ref: src/google/protobuf/wire_format_lite.h
  return {
    low: ((low >>> 1) | (high << 31)) ^ flip,
    high: (high >>> 1) ^ flip,
    unsigned: false,
  };
}

function writeVarint64ZigZag(bb: ByteBuffer, value: Long): void {
  let low = value.low;
  let high = value.high;
  let flip = high >> 31;

  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint64(bb, {
    low: (low << 1) ^ flip,
    high: ((high << 1) | (low >>> 31)) ^ flip,
    unsigned: false,
  });
}
