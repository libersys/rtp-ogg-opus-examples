import Debug from 'debug';
import dgram from 'dgram';
import { RtpDecoder } from 'rtp-ogg-opus';
import Speaker from 'speaker';

const debug = Debug('rtp-ogg-opus');

class Slin16Listener {
    public readonly host: string;
    public readonly port: number;

    constructor(options: { [key: string]: any }) {
        this.host = options.host;
        this.port = options.port;
    }

    async listen(): Promise<void> {
        return new Promise(resolve => {
            const socket = dgram.createSocket('udp4');
            const rtpDecoder = new RtpDecoder();

            const speaker = new Speaker({
                sampleRate: 16000,
                bitDepth: 16,
                channels: 1,
            });

            const bufferSize = 32 * 1024;
            let buffer = Buffer.alloc(bufferSize);
            let bufferPosition = 0;

            rtpDecoder.on('data', (packet: Buffer) => {
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

            socket.bind(
                {
                    port: this.port,
                    address: this.host,
                    exclusive: false,
                },
                () => {
                    debug(`Listening for RTP on port ${this.port}`);
                    resolve();
                },
            );
        });
    }
}

export default Slin16Listener;
