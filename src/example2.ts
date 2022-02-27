import Debug from 'debug';
import appRoot from 'app-root-path';
import path from 'path';

import Slin16Listener from './Slin16Listener';
import Slin16Player from './Slin16Player';

const debug = Debug('rtp-ogg-opus');

const options = {
    host: 'localhost',
    port: 4400,
    file: path.join(appRoot.path, 'samples/dialogflow.pcm'),
};

const main = async () => {
    try {
        debug('Running example:', JSON.stringify(options));

        const listener = new Slin16Listener(options);
        await listener.listen();

        const player = new Slin16Player(options);
        await player.play();
    } catch (err) {
        debug('error', err);
    }
};

main();
