import QueryWatcher from './queryWatcher';
import Tracer from './tracer';

import { expect } from 'chai';
import 'mocha';

describe('Query Watcher', () => {
  it('should start and stop watcher', () => {
    const tracer = new Tracer({ transports: [] });

    const queryWatcher = new QueryWatcher(tracer, {
      queryTimeout: 10 * 1000,
      watchInterval: 10 * 1000,
    });

    queryWatcher.start();
    expect(queryWatcher.isStarted()).to.equal(true);
    queryWatcher.stop();
    expect(queryWatcher.isStarted()).to.equal(false);
  });

  it('should detect stuck queries', done => {
    const tracer = new Tracer({ transports: [] });

    const command = {
      command: {
        $db: 'testdb',
        filter: {
          test: 1,
        },
        find: 'collection',
      },
      commandName: 'find',
      requestId: 1,
    };

    tracer.onCommandStart(command);

    const queryWatcher = new QueryWatcher(tracer, {
      queryTimeout: 500,
      watchInterval: 1000,
    });
    queryWatcher.start();

    const timeout = setTimeout(() => {
      done(new Error('Query watcher did not find stuck queries'));
    }, 2500);

    queryWatcher.on('stuck', requestId => {
      expect(requestId).to.be.equal(command.requestId);
      clearTimeout(timeout);
      queryWatcher.stop();
      done();
    });
  });
});
