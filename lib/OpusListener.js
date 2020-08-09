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
const debug = debug_1.default('*');
class OpusListener {
    constructor(options) {
        this.host = options.host;
        this.port = options.port;
    }
    listen() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const socket = dgram_1.default.createSocket('udp4');
                const decoder = new rtp_ogg_opus_1.RtpOpusToPcm({ sampleRate: 48000, channels: 2 });
                const speaker = new speaker_1.default({ sampleRate: 48000, channels: 2 });
                decoder.pipe(speaker);
                socket.on('error', err => {
                    debug('socket error', err);
                    socket.close();
                });
                socket.on('message', msg => {
                    decoder.write(msg);
                });
                socket.bind({
                    port: this.port,
                    address: this.host,
                    exclusive: false,
                });
                debug(`Listening for RTP on port ${this.port}`);
            }
            catch (err) {
                debug('error', err);
            }
        });
    }
}
exports.default = OpusListener;
