export type LogType = 'info' | 'error' | 'warning' | 'request';
export type LogSource = 'Proxy' | 'Repeater' | 'Settings' | 'System';
export type SortField = 'id' | 'timestamp' | 'source' | 'type' | 'method' | 'url' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: LogType;
  source: LogSource;
  message: string;
  details?: {
    method?: string;
    url?: string;
    status?: number | "pending" | "error";
    headers?: Record<string, string>;
    content?: string;
  };
}

export interface EnhancedLogEntry extends LogEntry {
  incrementalId: number;
  proxyId?: string;
}

export interface FilterOptions {
  method?: string;
  url?: string;
  status?: string;
  type?: string;
  source?: string;
}
