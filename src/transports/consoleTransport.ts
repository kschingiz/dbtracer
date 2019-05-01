import { ICommand } from './../tracer';
import { ITransport } from './transport';

import logger from './../logger';

class ConsoleTransport implements ITransport {
  public transport(traceCommand: ICommand) {
    const log = JSON.stringify(traceCommand, null, 2);
    logger.info(log);
  }
}

export default ConsoleTransport;
