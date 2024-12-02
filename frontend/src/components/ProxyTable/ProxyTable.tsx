import React from 'react';
import { Table, TableBody, TableContainer, Paper } from '@mui/material';
import { ProxyTableProps } from './types';
import { ProxyTableHeader } from './ProxyTableHeader';
import { ProxyTableRow } from './ProxyTableRow';
import { ProxyTableContextMenu } from './ProxyTableContextMenu';

export const ProxyTable: React.FC<ProxyTableProps> = ({
  logs,
  selectedLog,
  sortColumn,
  sortDirection,
  onSort,
  onSelectLog,
  onSendToRepeater,
  onDelete,
  tableState,
  tableHandlers,
}) => {
  const { 
    columns, 
    columnOrder,
    isResizing, 
    resizingColumnRef,
    isDragging,
    draggedColumn,
    targetColumn,
    contextMenu 
  } = tableState;
  const { 
    startResize, 
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleContextMenu,
    handleCloseContextMenu 
  } = tableHandlers;

  // Filter visible columns and order them according to columnOrder
  const visibleColumns = columnOrder
    .map(id => columns.find(col => col.id === id))
    .filter((col): col is NonNullable<typeof col> => 
      col !== undefined && col.visible
    );

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        maxHeight: '60vh',
        '& .MuiTableHead-root': {
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: 'background.paper'
        }
      }}
    >
      <Table stickyHeader size="small" style={{ tableLayout: 'fixed' }}>
        <ProxyTableHeader
          columns={columns}
          columnOrder={columnOrder}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          isResizing={isResizing}
          resizingColumnRef={resizingColumnRef}
          isDragging={isDragging}
          draggedColumn={draggedColumn}
          targetColumn={targetColumn}
          onSort={onSort}
          onStartResize={startResize}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        />
        <TableBody>
          {logs.map((log) => (
            <ProxyTableRow
              key={log.id}
              log={log}
              columns={visibleColumns}
              isSelected={selectedLog?.id === log.id}
              onSelect={(log) => onSelectLog(selectedLog?.id === log.id ? null : log)}
              onContextMenu={handleContextMenu}
              onSendToRepeater={onSendToRepeater}
            />
          ))}
        </TableBody>
      </Table>

      <ProxyTableContextMenu
        contextMenu={contextMenu}
        onClose={handleCloseContextMenu}
        onSendToRepeater={onSendToRepeater}
        onDelete={onDelete}
      />
    </TableContainer>
  );
};
