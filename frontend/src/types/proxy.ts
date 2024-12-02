export interface ProxyLog {
  id: number;
  timestamp: string;
  method: string;
  url: string;
  status?: number | "pending" | "error";
  content_length?: number;  // Made optional to maintain compatibility
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
}

export interface Column {
  id: string;
  label: string;
  width: number;
  sortable: boolean;
  visible: boolean;
  priority?: boolean;
}

export interface ProxyToolbarProps {
  onExportSession: () => void;
  onImportSession: () => void;
  onClearLogs: () => void;
  isLoading: boolean;
  filter: string;
  onFilterChange: (filter: string) => void;
  columns: Column[];
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
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
  onDelete: (log: ProxyLog) => void;
}

export type SortColumn = 'id' | 'timestamp' | 'method' | 'url' | 'status' | 'content_length';
export type SortDirection = 'asc' | 'desc';
