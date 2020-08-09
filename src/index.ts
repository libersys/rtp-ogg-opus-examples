import Debug from 'debug';
import appRoot from 'app-root-path';
import path from 'path';

import OpusListener from './OpusListener';
import OpusPlayer from './OpusPlayer';

const debug = Debug('*');

const options = {
    host: 'localhost',
    port: 4400,
    file: path.join(appRoot.path, 'samples', 'sample1.opus'),
};

const main = async () => {
    try {
        debug('Running example1:', JSON.stringify(options));

        const listener = new OpusListener(options);
        listener.listen();

        const player = new OpusPlayer(options);
        player.play();
    } catch (err) {
        debug('error', err);
    }
};

main();
