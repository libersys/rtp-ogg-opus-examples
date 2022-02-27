import Debug from 'debug';
import dgram from 'dgram';
import { RtpOpusToPcm } from 'rtp-ogg-opus';
import Speaker from 'speaker';

const debug = Debug('rtp-ogg-opus');

class OpusListener {
    public readonly host: string;
    public readonly port: number;

    constructor(options: { [key: string]: any }) {
        this.host = options.host;
        this.port = options.port;
    }

    async listen(): Promise<void> {
        return new Promise(resolve => {
            const socket = dgram.createSocket('udp4');
            const decoder = new RtpOpusToPcm({ sampleRate: 48000, channels: 2 });
            const speaker = new Speaker({ sampleRate: 48000, channels: 2 });

            decoder.pipe(speaker);

            socket.on('error', err => {
                debug('socket error', err);
                socket.close();
            });

            socket.on('message', msg => {
                decoder.write(msg);
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

export default OpusListener;
