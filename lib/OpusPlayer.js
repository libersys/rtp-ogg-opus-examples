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
const debug = (0, debug_1.default)('rtp-ogg-opus');
class OpusPlayer {
    constructor(options) {
        this.host = options.host;
        this.port = options.port;
        this.file = options.file;
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                const audioReader = fs_1.default.createReadStream(this.file, { highWaterMark: 8192 });
                const rtpEncoder = new rtp_ogg_opus_1.OggOpusToRtp({ sampleRate: 48000, payloadType: 120 });
                debug(`Sending opus file ${this.file}`);
                // To store RTP encoded packets.
                const packets = [];
                const frameSize = 20; // miliseconds
                const overhead = 5; // miliseconds - Increase if you are experiencing delays.
                const sendInterval = frameSize - overhead;
                const sendPacket = () => {
                    try {
                        const packet = packets.shift();
                        // Stop if no more packets.
                        if (!packet)
                            return resolve();
                        client.send(packet, this.port, this.host);
                        setTimeout(sendPacket, sendInterval);
                    }
                    catch (err) {
                        // On error, always try to keep sending packets.
                        setTimeout(sendPacket, sendInterval);
                    }
                };
                rtpEncoder.on('data', (packet) => {
                    if (packet && packet.length > 0)
                        packets.push(packet);
                });
                audioReader.once('readable', () => {
                    debug(`Sending opus file ${this.file}, audio stream started.`);
                    setTimeout(sendPacket, sendInterval);
                });
                audioReader.pipe(rtpEncoder);
            });
        });
    }
}
exports.default = OpusPlayer;
