export default class Logger {
  static log(message: string) {
    const { methodName, fileName } = Logger.getCallerInfo();
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${fileName} ${methodName}: ${message}`);
  }

  static info(message: string) {
    const { methodName, fileName } = Logger.getCallerInfo();
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${fileName} ${methodName}: ${message}`);
  }

  static warn(message: string) {
    const { methodName, fileName } = Logger.getCallerInfo();
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ${fileName} ${methodName}: ${message}`);
  }

  static error(message: string) {
    const { methodName, fileName } = Logger.getCallerInfo();
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${fileName} ${methodName}: ${message}`);
  }

  static getCallerInfo() {
    const stack = new Error().stack?.split('\n') || [];
    const callerStackLine = stack[3] || '';
    const callerInfo = callerStackLine.match(/at\s+(.+)\s+\((.+):(\d+):(\d+)\)/) || callerStackLine.match(/at\s+(.+):(\d+):(\d+)\)/);

    if (callerInfo) {
      const methodName = callerInfo[1];
      let fileName = callerInfo[2];

      try {
        const url = new URL(fileName);
        fileName = url.pathname;
      } catch (error) {
        // If file name is not a URL, keep it as is.
      }

      return { methodName, fileName };
    }

    return { methodName: 'unknown', fileName: 'unknown' };
  }
}
