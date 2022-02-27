"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const dgram_1 = __importDefault(require("dgram"));
const rtp_ogg_opus_1 = require("rtp-ogg-opus");
const speaker_1 = __importDefault(require("speaker"));
const debug = (0, debug_1.default)('rtp-ogg-opus');
class Slin16Listener {
    constructor(options) {
        this.host = options.host;
        this.port = options.port;
    }
    listen() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                const socket = dgram_1.default.createSocket('udp4');
                const rtpDecoder = new rtp_ogg_opus_1.RtpDecoder();
                const speaker = new speaker_1.default({
                    sampleRate: 16000,
                    bitDepth: 16,
                    channels: 1,
                });
                const bufferSize = 32 * 1024;
                let buffer = Buffer.alloc(bufferSize);
                let bufferPosition = 0;
                rtpDecoder.on('data', (packet) => {
                    if (packet && packet.length > 0) {
                        if (buffer.length - bufferPosition < packet.length) {
                            // If buffer will be full, send to speaker.
                            speaker.write(buffer);
                            // Clear buffer and restart position.
                            buffer = Buffer.alloc(bufferSize);
                            bufferPosition = 0;
                        }
                        packet.copy(buffer, bufferPosition, 0);
                        bufferPosition += packet.length;
                    }
                });
                socket.on('error', err => {
                    debug('socket error', err);
                    socket.close();
                });
                socket.on('message', msg => {
                    rtpDecoder.write(msg);
                });
                socket.bind({
                    port: this.port,
                    address: this.host,
                    exclusive: false,
                }, () => {
                    debug(`Listening for RTP on port ${this.port}`);
                    resolve();
                });
            });
        });
    }
}
exports.default = Slin16Listener;
