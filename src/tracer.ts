import { ITransport } from './transports/transport';

export interface ICommand {
  commandName: string;
  filter: any;
  sort: any;
  projection: any;
  db: string;
  collection: string;
  requestId: number;
  startDate: Date;
  endDate?: Date;
  status?: string;
  duration?: number;
}

export interface ICommandTracerOptions {
  transports: ITransport[];
}

export interface IMongoEvent {
  command: {
    find: string;
    filter: any;
    sort?: any;
    projection?: any;
    $db: string;
  };
  commandName: string;
  requestId: number;
}

class CommandTracer {
  private commands: Map<number, ICommand>;
  private transports: ITransport[];

  constructor(options: ICommandTracerOptions) {
    const { transports } = options;

    this.commands = new Map<number, ICommand>();
    this.transports = transports;
  }

  public getCommands() {
    return this.commands;
  }

  public onCommandStart(event: IMongoEvent) {
    const { command, commandName, requestId } = event;

    // we support only "find" as of now
    if (commandName === 'find') {
      const { find, filter, sort, projection } = command;

      const traceCommand = {
        collection: find,
        commandName,
        db: command.$db,
        filter,
        projection,
        requestId,
        sort,
        startDate: new Date(),
      };

      this.commands.set(requestId, traceCommand);
    }
  }

  public onCommandSuccess(event: IMongoEvent) {
    this.endTracing(event.requestId, 'success');
  }

  public onCommandStuck(requestId: number) {
    this.endTracing(requestId, 'stuck');
  }

  public onCommandFail(event: IMongoEvent) {
    this.endTracing(event.requestId, 'fail');
  }

  private endTracing(requestId: number, status: string) {
    const traceCommand = this.commands.get(requestId);

    if (traceCommand !== undefined) {
      const endDate = new Date();
      traceCommand.endDate = endDate;
      traceCommand.status = status;
      traceCommand.duration = traceCommand.endDate.getTime() - traceCommand.startDate.getTime();

      this.transports.forEach(transportImpl => {
        transportImpl.transport(traceCommand);
      });

      this.commands.delete(requestId);
    }
  }
}

export default CommandTracer;
