import { ProxyLog, SortColumn as BaseSortColumn, SortDirection } from '../../types/proxy';

export type { BaseSortColumn as SortColumn };

export interface ProxyTableProps {
  logs: ProxyLog[];
  selectedLog: ProxyLog | null;
  onSelectLog: (log: ProxyLog | null) => void;
  onSendToRepeater: (log: ProxyLog) => void;
  onDelete: (log: ProxyLog) => void;
  sortColumn: BaseSortColumn;
  sortDirection: SortDirection;
  onSort: (column: BaseSortColumn) => void;
}

export interface Column {
  id: string;
  label: string;
  width: number;
  sortable: boolean;
}

export interface ProxyTableState {
  columns: Column[];
  isResizing: boolean;
  resizingColumnRef: number | null;
  startX: number;
  startWidth: number;
  contextMenu: {
    mouseX: number;
    mouseY: number;
    log: ProxyLog | null;
  } | null;
}

export interface ResizeHandlers {
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: () => void;
  startResize: (index: number, event: React.MouseEvent) => void;
}

export interface ProxyTableHandlers extends ResizeHandlers {
  handleContextMenu: (event: React.MouseEvent, log: ProxyLog) => void;
  handleCloseContextMenu: () => void;
}
