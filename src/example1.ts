import Debug from 'debug';
import appRoot from 'app-root-path';
import path from 'path';

import OpusListener from './OpusListener';
import OpusPlayer from './OpusPlayer';

const debug = Debug('rtp-ogg-opus');

const options = {
    host: 'localhost',
    port: 4400,
    // file: path.join(appRoot.path, 'samples/bensound-dreams.opus'),
    file: path.join(appRoot.path, 'samples/bensound-hey.opus'),
    // file: path.join(appRoot.path, 'samples/bensound-hipjazz.opus'),
};

const main = async () => {
    try {
        debug('Running example:', JSON.stringify(options));

        const listener = new OpusListener(options);
        await listener.listen();

        const player = new OpusPlayer(options);
        await player.play();
    } catch (err) {
        debug('error', err);
    }
};

main();
