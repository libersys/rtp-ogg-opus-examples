import Debug from 'debug';
import fs from 'fs';
import dgram from 'dgram';
import { RtpEncoder } from 'rtp-ogg-opus';
import AudioStream from './AudioStream';
import { PassThrough } from 'stream';

const client = dgram.createSocket('udp4');
const debug = Debug('rtp-ogg-opus');

class Slin16Player {
    public readonly host: string;
    public readonly port: number;
    public readonly file: string;
    public readonly encoder: PassThrough;

    constructor(options: { [key: string]: any }) {
        this.host = options.host;
        this.port = options.port;
        this.file = options.file;
        this.encoder = new PassThrough();
    }

    async play() {
        return new Promise<void>((resolve, reject) => {
            try {
                const rawData = fs.readFileSync(this.file);
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
                const audioStream = new AudioStream({ chunkSize: bytesPerFrame });

                const rtpEncoder = new RtpEncoder({ payloadType: payloadType, samples: samplesPerFrame });

                // To store RTP encoded packets.
                const packets: Buffer[] = [];

                const sendPacket = () => {
                    try {
                        const packet = packets.shift();

                        // Stop if no more packets.
                        if (!packet) return resolve();

                        client.send(packet, this.port, this.host);

                        setTimeout(sendPacket, sendInterval);
                    } catch (err) {
                        // On error, always try to keep sending packets.
                        setTimeout(sendPacket, sendInterval);
                    }
                };

                rtpEncoder.on('data', (packet: Buffer) => {
                    if (packet && packet.length > 0) packets.push(packet);
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
            } catch (err) {
                debug('error', err);
                return reject();
            }
        });
    }
}

export default Slin16Player;
