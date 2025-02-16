type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

function formatLog(level: LogLevel, message: string, data?: Record<string, unknown>): LogMessage {
  return {
    level,
    timestamp: new Date().toISOString(),
    message,
    data,
  };
}

const logger = {
  debug(message: string, data?: Record<string, unknown>) {
    if (__DEV__) {
      console.debug(formatLog('debug', message, data));
    }
  },

  info(message: string, data?: Record<string, unknown>) {
    console.info(formatLog('info', message, data));
  },

  warn(message: string, data?: Record<string, unknown>) {
    console.warn(formatLog('warn', message, data));
  },

  error(message: string, data?: Record<string, unknown>) {
    console.error(formatLog('error', message, data));
  },
};

export default logger;
