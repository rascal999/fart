// Proxy Types
export interface ProxyLog {
  id: number;
  timestamp: string;
  method: string;
  url: string;
  status?: number | "pending" | "error";
  content_length?: number;
  request?: {
    method: string;
    url: string;
    headers: Record<string, string>;
    content: string | null;
  };
  response?: {
    status_code: number;
    headers: Record<string, string>;
    content: string | null;
  };
  error?: string;
}

// Settings Types
export interface Settings {
  proxy_port: number;
  ui_port: number;
  debug_level: string;
  enable_filtering: boolean;
  filter_rules: string[];
  upstream_proxy_enabled: boolean;
  upstream_proxy_host: string | null;
  upstream_proxy_port: number | null;
  upstream_proxy_auth: boolean;
  upstream_proxy_username: string | null;
  upstream_proxy_password: string | null;
}

// Session Types
export interface SessionData {
  logs: ProxyLog[];
  settings: Settings;
  timestamp: string;
}

// Logging Types
export type LogType = 'info' | 'error' | 'warning' | 'request';
export type LogSource = 'Proxy' | 'Repeater' | 'Settings' | 'System';

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

// Repeater Types
export interface RepeaterRequest {
  method: string;
  url: string;
  headers: string;
  body: string;
  follow_redirects?: boolean;
}
