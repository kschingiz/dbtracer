import { ICommand } from './../tracer';

export interface ITransport {
  transport(traceCommand: ICommand): void;
}
