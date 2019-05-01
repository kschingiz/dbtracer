import { EventEmitter } from 'events';
import CommandTracer from './tracer';
import { clearInterval, setInterval } from 'timers';

export interface IQueryWatcherOptions {
  watchInterval?: number;
  queryTimeout?: number;
}

class QueryWatcher extends EventEmitter {
  private watchInterval: number;
  private queryTimeout: number;
  private tracer: CommandTracer;
  private interval: NodeJS.Timeout | undefined;

  constructor(tracer: CommandTracer, options: IQueryWatcherOptions) {
    super();
    this.watchInterval = options.watchInterval || 10 * 1000;
    this.queryTimeout = options.queryTimeout || 5 * 1000;

    this.tracer = tracer;
  }

  public isStarted() {
    return this.interval !== undefined;
  }

  public start() {
    if (this.interval === undefined) {
      this.interval = setInterval(() => {
        this.iterateQueries();
      }, this.watchInterval);
    }
  }

  public stop() {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
      // clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  private iterateQueries() {
    const currentTime = new Date().getTime();
    const queryTimeout = this.queryTimeout;

    const commandsMap = this.tracer.getCommands();

    commandsMap.forEach((command, requestId, map) => {
      if (currentTime - command.startDate.getTime() >= queryTimeout) {
        this.emit('stuck', requestId);
      }
    });
  }
}

export default QueryWatcher;
