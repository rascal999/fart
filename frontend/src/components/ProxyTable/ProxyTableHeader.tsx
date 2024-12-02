import React from 'react';
import { TableHead, TableRow, TableSortLabel } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { StyledTableCell } from './styles';
import { Column, SortColumn, SortDirection } from '../../types/proxy';

interface ProxyTableHeaderProps {
  columns: Column[];
  columnOrder: string[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  isResizing: boolean;
  resizingColumnRef: number | null;
  isDragging: boolean;
  draggedColumn: string | null;
  targetColumn: string | null;
  onSort: (columnId: SortColumn) => void;
  onStartResize: (index: number, e: React.MouseEvent) => void;
  onDragStart: (columnId: string) => void;
  onDragOver: (columnId: string) => void;
  onDragEnd: () => void;
}

export const ProxyTableHeader: React.FC<ProxyTableHeaderProps> = ({
  columns,
  columnOrder,
  sortColumn,
  sortDirection,
  isResizing,
  resizingColumnRef,
  isDragging,
  draggedColumn,
  targetColumn,
  onSort,
  onStartResize,
  onDragStart,
  onDragOver,
  onDragEnd,
}) => {
  const handleSort = (columnId: string) => {
    if (columnId === 'id' || 
        columnId === 'timestamp' || 
        columnId === 'method' || 
        columnId === 'url' || 
        columnId === 'status') {
      onSort(columnId as SortColumn);
    }
  };

  // Order columns based on columnOrder and filter by visibility
  const orderedColumns = columnOrder
    .map(id => columns.find(col => col.id === id))
    .filter((col): col is Column => col !== undefined && col.visible);

  return (
    <TableHead>
      <TableRow>
        {orderedColumns.map((column, index) => (
          <StyledTableCell 
            key={column.id}
            style={{ width: column.width }}
            className={`
              ${isDragging && draggedColumn === column.id ? 'dragging' : ''}
              ${isDragging && targetColumn === column.id ? 'drop-target' : ''}
            `}
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              onDragStart(column.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (draggedColumn && draggedColumn !== column.id) {
                onDragOver(column.id);
              }
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('dragging-over');
            }}
            onDragEnd={(e) => {
              e.currentTarget.classList.remove('dragging-over');
              onDragEnd();
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedColumn && draggedColumn !== column.id) {
                onDragEnd();
              }
            }}
          >
            <div className={`header-content ${column.priority ? 'priority' : ''}`}>
              <DragIndicatorIcon 
                className={`drag-handle ${isDragging && draggedColumn === column.id ? 'dragging' : ''}`}
                fontSize="small"
              />
              {column.sortable ? (
                <TableSortLabel
                  active={sortColumn === column.id}
                  direction={sortColumn === column.id ? sortDirection : 'asc'}
                  onClick={() => handleSort(column.id)}
                >
                  {column.label}
                </TableSortLabel>
              ) : column.label}
            </div>
            {index < orderedColumns.length - 1 && (
              <div
                className={`resizer ${isResizing && resizingColumnRef === index ? 'isResizing' : ''}`}
                onMouseDown={(e) => onStartResize(index, e)}
              />
            )}
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
