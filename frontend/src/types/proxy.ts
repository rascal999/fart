export interface ProxyLog {
  id: number;
  timestamp: string;
  method: string;
  url: string;
  status?: number | "pending" | "error";
  request_headers?: Record<string, string>;
  request_content?: string;
  response_headers?: Record<string, string>;
  response_content?: string;
  error?: string;
}

export interface ProxyToolbarProps {
  onExportSession: () => void;
  onImportSession: () => void;
  onClearLogs: () => void;
  isLoading: boolean;
  filter: string;
  onFilterChange: (filter: string) => void;
}

export interface ProxyDetailsProps {
  log: ProxyLog | null;
}

export interface ProxyTableProps {
  logs: ProxyLog[];
  selectedLog: ProxyLog | null;
  onSelectLog: (log: ProxyLog | null) => void;
  onSendToRepeater: (log: ProxyLog) => void;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

export type SortColumn = 'id' | 'timestamp' | 'method' | 'url' | 'status';
export type SortDirection = 'asc' | 'desc';
