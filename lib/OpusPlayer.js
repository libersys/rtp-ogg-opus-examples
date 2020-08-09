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
const fs_1 = __importDefault(require("fs"));
const dgram_1 = __importDefault(require("dgram"));
const rtp_ogg_opus_1 = require("rtp-ogg-opus");
const client = dgram_1.default.createSocket('udp4');
const debug = debug_1.default('*');
class OpusPlayer {
    constructor(options) {
        this.host = options.host;
        this.port = options.port;
        this.file = options.file;
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const reader = fs_1.default.createReadStream(this.file, { highWaterMark: 8192 });
                const encoder = new rtp_ogg_opus_1.OggOpusToRtp({ sampleRate: 48000, payloadType: 120 });
                let interval;
                const packets = [];
                const frameSize = 20; // miliseconds
                const overhead = 1; // miliseconds
                let last = new Date().getTime();
                const sendPacket = () => {
                    try {
                        const packet = packets.shift();
                        if (packet)
                            client.send(packet, this.port, this.host);
                        // Check interval
                        const now = new Date().getTime();
                        const elapsed = now - last;
                        if (elapsed > frameSize) {
                            interval = setTimeout(sendPacket, 2 * frameSize - elapsed - overhead); // Speed up.
                        }
                        else {
                            interval = setTimeout(sendPacket, frameSize - overhead); // Keep the same pace.
                        }
                        last = now;
                    }
                    catch (err) {
                        // On error, always try to keep sending packets.
                        interval = setTimeout(sendPacket, frameSize - overhead);
                    }
                };
                encoder.on('data', (chunk) => {
                    if (chunk && chunk.length > 0)
                        packets.push(chunk);
                });
                reader.once('readable', () => {
                    debug(`Sending RTP packets to ${this.host}:${this.port}`);
                    interval = setTimeout(sendPacket, frameSize - overhead);
                });
                reader.pipe(encoder);
            }
            catch (err) {
                debug('error', err);
            }
        });
    }
}
exports.default = OpusPlayer;
