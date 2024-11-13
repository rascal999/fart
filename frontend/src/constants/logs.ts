import { LogType, LogSource } from '../types/logs';

export const LOG_TYPES: Record<LogType, { label: string; color: string }> = {
  info: { label: 'Info', color: '#4dabf7' },
  error: { label: 'Error', color: '#ff6b6b' },
  warning: { label: 'Warning', color: '#ffd43b' },
  request: { label: 'Request', color: '#69db7c' }
};

export const SOURCE_COLORS: Record<LogSource, string> = {
  Proxy: '#4dabf7',
  Repeater: '#69db7c',
  Settings: '#ffd43b',
  System: '#868e96'
};
