import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, splat, simple, label } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
  if (label) {
    return `${timestamp} [${label}] ${level}: ${message}`;
  }

  return `${timestamp} ${level}: ${message}`;
});

const logger = (labelText) =>
  createLogger({
    format: combine(label({ label: labelText }), timestamp(), splat(), simple(), loggerFormat),
    transports: [new transports.Console()],
  });

export default logger;
