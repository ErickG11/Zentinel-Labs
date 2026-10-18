import 'server-only';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = Record<string, string | number | boolean | null | undefined>;

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
}

export interface Logger {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
}

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

interface LoggerOptions {
  minLevel: LogLevel;
  write: (entry: LogEntry) => void;
}

export const createLogger = ({ minLevel, write }: LoggerOptions): Logger => {
  const log =
    (level: LogLevel) =>
    (message: string, context?: LogContext): void => {
      if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[minLevel]) return;
      write({ level, message, context, timestamp: new Date().toISOString() });
    };
  return { debug: log('debug'), info: log('info'), warn: log('warn'), error: log('error') };
};

/* eslint-disable no-console -- salida estructurada del logger centralizado */
const consoleWriter = (entry: LogEntry): void => {
  const line = JSON.stringify(entry);
  if (entry.level === 'error') console.error(line);
  else if (entry.level === 'warn') console.warn(line);
  else console.info(line);
};
/* eslint-enable no-console */

export const logger = createLogger({
  minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  write: consoleWriter,
});
