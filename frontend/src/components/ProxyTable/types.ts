import { ProxyLog, SortColumn as BaseSortColumn, SortDirection } from '../../types/proxy';

export type { BaseSortColumn as SortColumn };

export interface Column {
  id: string;
  label: string;
  width: number;
  sortable: boolean;
  visible: boolean;
  priority?: boolean; // For ID, Timestamp, Method, URL, Status
}

export interface ContextMenu {
  mouseX: number;
  mouseY: number;
  log: ProxyLog;
}

export interface ProxyTableState {
  columns: Column[];
  columnOrder: string[]; // For maintaining column order
  isResizing: boolean;
  resizingColumnRef: number | null;
  startX: number;
  startWidth: number;
  contextMenu: ContextMenu | null;
  isDragging: boolean;
  draggedColumn: string | null;
  targetColumn: string | null;
}

export interface ResizeHandlers {
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: () => void;
  startResize: (index: number, event: React.MouseEvent) => void;
}

export interface DragHandlers {
  handleDragStart: (columnId: string) => void;
  handleDragOver: (columnId: string) => void;
  handleDragEnd: () => void;
  handleColumnVisibilityChange: (columnId: string, visible: boolean) => void;
}

export interface ProxyTableHandlers extends ResizeHandlers, DragHandlers {
  handleContextMenu: (event: React.MouseEvent, log: ProxyLog) => void;
  handleCloseContextMenu: () => void;
}

export interface ProxyTableProps {
  logs: ProxyLog[];
  selectedLog: ProxyLog | null;
  onSelectLog: (log: ProxyLog | null) => void;
  onSendToRepeater: (log: ProxyLog) => void;
  onDelete: (log: ProxyLog) => void;
  sortColumn: BaseSortColumn;
  sortDirection: SortDirection;
  onSort: (column: BaseSortColumn) => void;
  tableState: ProxyTableState;
  tableHandlers: ProxyTableHandlers;
}
