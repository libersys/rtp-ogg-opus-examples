"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slin16Decoder = void 0;
const stream_1 = require("stream");
class Slin16Decoder extends stream_1.Transform {
    _transform(chunk, encoding, callback) {
        this.push(chunk.slice(12).swap16());
        callback();
    }
}
exports.Slin16Decoder = Slin16Decoder;
exports.default = Slin16Decoder;
