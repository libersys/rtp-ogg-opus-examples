"use strict";
/*
  This class is a modified typescript version of the ReadableStreamBuffer class
  from Node Stream Buffers module (https://github.com/samcday/node-stream-buffer).
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioStream = void 0;
/*
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
© 2020 GitHub, Inc.
*/
const debug_1 = __importDefault(require("debug"));
const stream_1 = require("stream");
const debug = (0, debug_1.default)('*');
const constants = {
    DEFAULT_INITIAL_SIZE: 8 * 1024,
    DEFAULT_INCREMENT_AMOUNT: 8 * 1024,
    DEFAULT_FREQUENCY: 1,
    DEFAULT_CHUNK_SIZE: 1024,
};
class AudioStream extends stream_1.Readable {
    constructor(options = {}) {
        super();
        this._stopped = false;
        this._size = 0;
        this._counter = 0;
        this._buffer = Buffer.alloc(0);
        this._allowPush = false;
        this.frequency = options.frequency || constants.DEFAULT_FREQUENCY;
        this.chunkSize = options.chunkSize || constants.DEFAULT_CHUNK_SIZE;
        this.initialSize = options.initialSize || constants.DEFAULT_INITIAL_SIZE;
        this.incrementAmount = options.incrementAmount || constants.DEFAULT_INCREMENT_AMOUNT;
        this._buffer = Buffer.alloc(this.initialSize);
    }
    get stopped() {
        return this._stopped;
    }
    get size() {
        return this._size;
    }
    get maxSize() {
        var _a;
        return (_a = this._buffer) === null || _a === void 0 ? void 0 : _a.length;
    }
    stop() {
        // if (this._stopped) {
        //     throw new Error('stop() called on already stopped AudioStream');
        // }
        this._stopped = true;
        // if (this._size === 0) {
        //     debug('AudioStream end');
        //     this.emit('end');
        //     // this.push(null);
        // }
    }
    put(data) {
        if (this.stopped)
            throw new Error('Tried to write data to a stopped AudioStream');
        this.increaseBufferIfNecessary(data.length);
        data.copy(this._buffer, this._size, 0);
        this._size += data.length;
        this.kickSendDataTask();
    }
    _read() {
        this._allowPush = true;
        this.kickSendDataTask();
    }
    kickSendDataTask() {
        const sendData = () => {
            const amount = Math.min(this.chunkSize, this._size);
            let sendMore = false;
            if (amount > 0) {
                const chunk = Buffer.alloc(amount);
                this._buffer.copy(chunk, 0, 0, amount);
                sendMore = this.push(chunk) !== false;
                this._allowPush = sendMore;
                // debug('AudioStream chunk sent:', chunk.length);
                this._buffer.copy(this._buffer, 0, amount, this._size);
                this._size -= amount;
                this._counter += amount;
            }
            if (this._size === 0 || this.stopped) {
                debug('AudioStream end, bytes sent:', this._counter);
                this.emit('end');
                sendMore = false;
            }
            if (sendMore) {
                this._timeout = setTimeout(sendData, this.frequency);
            }
            else {
                this._timeout = undefined;
            }
        };
        if (!this._timeout && this._allowPush) {
            this._timeout = setTimeout(sendData, this.frequency);
        }
    }
    increaseBufferIfNecessary(incomingDataSize) {
        if (this._buffer.length - this._size < incomingDataSize) {
            const factor = Math.ceil((incomingDataSize - (this._buffer.length - this._size)) / this.incrementAmount);
            const newBuffer = Buffer.alloc(this._buffer.length + this.incrementAmount * factor);
            this._buffer.copy(newBuffer, 0, 0, this._size);
            this._buffer = newBuffer;
        }
    }
}
exports.AudioStream = AudioStream;
exports.default = AudioStream;
