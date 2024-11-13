import { LogEntry, LogType, LogSource } from './types';

type LogCallback = (entry: LogEntry) => void;
const logCallbacks: LogCallback[] = [];

const loggingService = {
  subscribe: (callback: LogCallback) => {
    logCallbacks.push(callback);
    return () => {
      const index = logCallbacks.indexOf(callback);
      if (index > -1) {
        logCallbacks.splice(index, 1);
      }
    };
  },
  
  log: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const fullEntry: LogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    logCallbacks.forEach(callback => callback(fullEntry));
    return fullEntry;
  },

  // Notify all subscribers of multiple log entries
  notifyMultiple: (entries: LogEntry[]) => {
    entries.forEach(entry => {
      logCallbacks.forEach(callback => callback(entry));
    });
  },

  // Helper methods for common log types
  info: (source: LogSource, message: string, details?: LogEntry['details']) => {
    return loggingService.log({ type: 'info', source, message, details });
  },

  error: (source: LogSource, message: string, details?: LogEntry['details']) => {
    return loggingService.log({ type: 'error', source, message, details });
  },

  warning: (source: LogSource, message: string, details?: LogEntry['details']) => {
    return loggingService.log({ type: 'warning', source, message, details });
  },

  request: (source: LogSource, message: string, details?: LogEntry['details']) => {
    return loggingService.log({ type: 'request', source, message, details });
  }
};

export default loggingService;
