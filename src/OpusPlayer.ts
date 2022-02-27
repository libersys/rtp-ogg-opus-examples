import Debug from 'debug';
import fs from 'fs';
import dgram from 'dgram';
import { OggOpusToRtp } from 'rtp-ogg-opus';

const client = dgram.createSocket('udp4');
const debug = Debug('rtp-ogg-opus');

class OpusPlayer {
    public readonly host: string;
    public readonly port: number;
    public readonly file: string;

    constructor(options: { [key: string]: any }) {
        this.host = options.host;
        this.port = options.port;
        this.file = options.file;
    }

    async play(): Promise<void> {
        return new Promise(resolve => {
            const audioReader = fs.createReadStream(this.file, { highWaterMark: 8192 });
            const rtpEncoder = new OggOpusToRtp({ sampleRate: 48000, payloadType: 120 });

            debug(`Sending opus file ${this.file}`);

            // To store RTP encoded packets.
            const packets: Buffer[] = [];

            const frameSize = 20; // miliseconds
            const overhead = 5; // miliseconds - Increase if you are experiencing delays.
            const sendInterval = frameSize - overhead;

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

            audioReader.once('readable', () => {
                debug(`Sending opus file ${this.file}, audio stream started.`);
                setTimeout(sendPacket, sendInterval);
            });

            audioReader.pipe(rtpEncoder);
        });
    }
}

export default OpusPlayer;
