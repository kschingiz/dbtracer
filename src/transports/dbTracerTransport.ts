import * as request from 'request';
import { ICommand } from './../tracer';
import { ITransport } from './transport';

import logger from './../logger';

interface IDBTracerTransportOptions {
  url: string;
}

class DBTracerTransport implements ITransport {
  private static ENDPOINTS = {
    COMMAND: 'command',
  };
  private options: IDBTracerTransportOptions;

  constructor(options: IDBTracerTransportOptions) {
    this.options = options;
  }

  public transport(traceCommand: ICommand) {
    const endpoint = this.getEndpoint(DBTracerTransport.ENDPOINTS.COMMAND);

    request.put(endpoint, { json: traceCommand }, (err, response) => {
      if (err) {
        logger.error(`failed to send traces: ${endpoint}`);
      }
    });
  }

  private getEndpoint(endpoint: string) {
    return `${this.options.url}${endpoint}`;
  }
}

export default DBTracerTransport;
