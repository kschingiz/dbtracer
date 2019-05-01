import QueryWatcher from './queryWatcher';
import Tracer from './tracer';
import ConsoleTransport from './transports/consoleTransport';
import DBTracerTransport from './transports/dbTracerTransport';

import logger from './logger';

export interface IStartOptions {
  consoleLog: boolean;
  dbtracerServer?: string;
  mongodb: any;
  startQueryWatcher: boolean;
  queryWatcherInterval: number;
  queryTimeout: number;
}

export interface IStartReturns {
  listener: any;
  tracer: Tracer;
  queryWatcher: QueryWatcher;
}

function start(options: IStartOptions): IStartReturns | null {
  const { mongodb } = options;
  if (typeof mongodb.instrument === 'function') {
    const transports = [];

    if (options.consoleLog) {
      transports.push(new ConsoleTransport());
    }
    if (options.dbtracerServer) {
      transports.push(new DBTracerTransport({ url: options.dbtracerServer }));
    }

    const tracer = new Tracer({
      transports,
    });

    const listener = mongodb.instrument();

    listener.on('started', tracer.onCommandStart.bind(tracer));
    listener.on('succeeded', tracer.onCommandSuccess.bind(tracer));
    listener.on('failed', tracer.onCommandFail.bind(tracer));

    const queryWatcher = new QueryWatcher(tracer, {
      queryTimeout: options.queryTimeout,
      watchInterval: options.queryWatcherInterval,
    });

    queryWatcher.on('stuck', tracer.onCommandStuck.bind(tracer));

    if (options.startQueryWatcher) {
      queryWatcher.start();
    }

    return {
      listener,
      queryWatcher,
      tracer,
    };
  } else {
    logger.error("mongodb doen't support instrumenting");
    return null;
  }
}

export { start };
