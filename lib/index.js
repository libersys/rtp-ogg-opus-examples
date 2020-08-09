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
const OpusListener_1 = __importDefault(require("./OpusListener"));
const OpusPlayer_1 = __importDefault(require("./OpusPlayer"));
const debug = debug_1.default('*');
const options = {
    host: 'localhost',
    port: 4400,
    file: path_1.default.join(app_root_path_1.default.path, 'samples', 'sample1.opus'),
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debug('Running example1:', JSON.stringify(options));
        const listener = new OpusListener_1.default(options);
        listener.listen();
        const player = new OpusPlayer_1.default(options);
        player.play();
    }
    catch (err) {
        debug('error', err);
    }
});
main();
