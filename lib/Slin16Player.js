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
const AudioStream_1 = __importDefault(require("./AudioStream"));
const stream_1 = require("stream");
const client = dgram_1.default.createSocket('udp4');
const debug = (0, debug_1.default)('rtp-ogg-opus');
class Slin16Player {
    constructor(options) {
        this.host = options.host;
        this.port = options.port;
        this.file = options.file;
        this.encoder = new stream_1.PassThrough();
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    const rawData = fs_1.default.readFileSync(this.file);
                    debug(`Sending PCM file ${this.file}, raw data length: ${rawData.length}`);
                    // Remove the WAV header and swap16 it to big endian (the file is little endian).
                    const pcmAudio = rawData.slice(44).swap16();
                    debug(`Sending PCM file ${this.file}, audio data length: ${pcmAudio.length}`);
                    const payloadType = 11;
                    const bitDepth = 16;
                    const sampleRate = 16000; // Hertz
                    const sampleSize = bitDepth / 8; // Bytes
                    const frameSize = 20; // miliseconds
                    const overhead = 5; // miliseconds - Increase if you are experiencing delays.
                    const sendInterval = frameSize - overhead;
                    const framesPerSecond = 1000 / frameSize;
                    const samplesPerFrame = sampleRate / framesPerSecond;
                    const bytesPerFrame = samplesPerFrame * sampleSize;
                    debug(`Slicing audio data in ${bytesPerFrame} bytes chunks.`);
                    const audioStream = new AudioStream_1.default({ chunkSize: bytesPerFrame });
                    const rtpEncoder = new rtp_ogg_opus_1.RtpEncoder({ payloadType: payloadType, samples: samplesPerFrame });
                    // To store RTP encoded packets.
                    const packets = [];
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
                    audioStream.once('readable', () => {
                        debug(`Sending PCM file ${this.file}, audioStream started.`);
                        setTimeout(sendPacket, sendInterval);
                    });
                    audioStream.on('end', () => {
                        debug(`Sending PCM file ${this.file}, audioStream ended.`);
                    });
                    audioStream.pipe(rtpEncoder);
                    // Write audio data to stream.
                    audioStream.put(pcmAudio);
                }
                catch (err) {
                    debug('error', err);
                    return reject();
                }
            });
        });
    }
}
exports.default = Slin16Player;
