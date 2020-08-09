import Debug from 'debug';
import fs from 'fs';
import dgram from 'dgram';
import { OggOpusToRtp } from 'rtp-ogg-opus';

const client = dgram.createSocket('udp4');
const debug = Debug('*');

class OpusPlayer {
    public readonly host: string;
    public readonly port: number;
    public readonly file: string;

    constructor(options: { [key: string]: any }) {
        this.host = options.host;
        this.port = options.port;
        this.file = options.file;
    }

    async play() {
        try {
            const reader = fs.createReadStream(this.file, { highWaterMark: 8192 });
            const encoder = new OggOpusToRtp({ sampleRate: 48000, payloadType: 120 });

            let interval: NodeJS.Timeout;
            const packets: Buffer[] = [];

            const frameSize = 20; // miliseconds
            const overhead = 1; // miliseconds

            let last = new Date().getTime();

            const sendPacket = () => {
                try {
                    const packet = packets.shift();
                    if (packet) client.send(packet, this.port, this.host);

                    // Check interval
                    const now = new Date().getTime();
                    const elapsed = now - last;

                    if (elapsed > frameSize) {
                        interval = setTimeout(sendPacket, 2 * frameSize - elapsed - overhead); // Speed up.
                    } else {
                        interval = setTimeout(sendPacket, frameSize - overhead); // Keep the same pace.
                    }

                    last = now;
                } catch (err) {
                    // On error, always try to keep sending packets.
                    interval = setTimeout(sendPacket, frameSize - overhead);
                }
            };

            encoder.on('data', (chunk: Buffer) => {
                if (chunk && chunk.length > 0) packets.push(chunk);
            });

            reader.once('readable', () => {
                debug(`Sending RTP packets to ${this.host}:${this.port}`);
                interval = setTimeout(sendPacket, frameSize - overhead);
            });

            reader.pipe(encoder);
        } catch (err) {
            debug('error', err);
        }
    }
}

export default OpusPlayer;
