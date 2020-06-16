import { createLogger, format, transports } from 'winston';

const logFormat = format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`);

export const logger = createLogger({
  level: process.env.LOGGING || 'info',
  format: format.combine(format.colorize(), format.timestamp({ format: 'HH:mm:ss.SS' }), format.align(), logFormat),
  transports: [
    new transports.Console({
      silent: process.env.LOGGING === 'none'
    })
  ]
});
