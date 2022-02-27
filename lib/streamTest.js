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
const app_root_path_1 = __importDefault(require("app-root-path"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const stream_1 = require("stream");
const s3Buffer = Buffer.alloc(256, 55);
const readableStream = stream_1.Readable.from(s3Buffer);
// formData: {page: readableStream}
readableStream.on('data', chunk => {
    debug('readableStream chunk:', chunk);
});
const debug = (0, debug_1.default)('rtp-ogg-opus');
const file = path_1.default.join(app_root_path_1.default.path, 'samples/dialogflow.pcm');
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myStream = stream_1.Readable.from(s3Buffer);
        myStream.on('data', chunk => {
            debug('Running myStream chunk:', chunk);
        });
        // debug('Running stream test:', JSON.stringify(s3Buffer));
        const fileStream = fs_1.default.createReadStream(file);
        fileStream.on('data', chunk => {
            debug('Running stream test chunk:', chunk);
        });
    }
    catch (err) {
        debug('error', err);
    }
});
main();
