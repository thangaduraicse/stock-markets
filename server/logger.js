import { addColors, createLogger, format as winstonAvailableFormats, transports } from 'winston';

const { colorize, combine, label, printf, splat, simple, timestamp } = winstonAvailableFormats;
const { Console, File } = transports;

class Logger {
  #label;

  static get Colors() {
    return {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      http: 'magenta',
      debug: 'white',
    };
  }

  static get Levels() {
    return {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
    };
  }

  constructor(label) {
    this.log = this.#onInit(label);
  }

  #onInit(label) {
    addColors(Logger.Colors);

    const level = this.#getLevel();
    const levels = Logger.Levels;
    const format = this.#getFormat(label);
    const transports = this.#getTransports();

    return createLogger({ level, levels, format, transports });
  }

  #getLevel() {
    const environment = process.env.NODE_ENV || 'development';

    switch (environment) {
      case 'development': {
        return 'debug';
      }
      case 'testing': {
        return 'info';
      }
      case 'production': {
        return 'error';
      }
      default: {
        return 'warn';
      }
    }
  }

  #getFormat(labelText) {
    return combine(
      label({ label: labelText }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      splat(),
      simple(),
      colorize({ all: true }),
      printf(({ level, message, label, timestamp }) => {
        if (label) {
          return `${timestamp} [${label}] ${level}: ${message}`;
        }

        return `${timestamp} ${level}: ${message}`;
      })
    );
  }

  #getTransports() {
    return [
      new Console(),
      new File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      new File({ filename: 'logs/all.log' }),
    ];
  }
}

export default Logger;
