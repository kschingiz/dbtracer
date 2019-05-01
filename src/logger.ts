import * as winston from 'winston';

const logger = winston.createLogger({
  defaultMeta: { service: 'dbtracer' },
  format: winston.format.json(),
  level: 'info',
});

export default logger;
