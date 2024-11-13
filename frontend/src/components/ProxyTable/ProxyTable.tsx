import React from 'react';
import { 
  Table, 
  TableBody, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TableSortLabel,
  Paper,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { StyledTableCell } from './styles';
import { useProxyTable } from './useProxyTable';
import { ProxyTableProps } from './types';
import { generateCurlCommand } from '../../utils/proxyUtils';

export const ProxyTable: React.FC<ProxyTableProps> = ({
  logs,
  selectedLog,
  sortColumn,
  sortDirection,
  onSort,
  onSelectLog,
  onSendToRepeater,
  onDelete,
}) => {
  const [state, handlers] = useProxyTable();
  const { 
    columns, 
    isResizing, 
    resizingColumnRef,
    contextMenu 
  } = state;
  const { 
    startResize, 
    handleContextMenu,
    handleCloseContextMenu 
  } = handlers;

  const handleSort = (columnId: string) => {
    if (columnId === 'id' || 
        columnId === 'timestamp' || 
        columnId === 'method' || 
        columnId === 'url' || 
        columnId === 'status') {
      onSort(columnId as typeof sortColumn);
    }
  };

  const handleCopyUrl = () => {
    if (contextMenu?.log) {
      navigator.clipboard.writeText(contextMenu.log.url);
      handleCloseContextMenu();
    }
  };

  const handleCopyAsCurl = () => {
    if (contextMenu?.log) {
      navigator.clipboard.writeText(generateCurlCommand(contextMenu.log));
      handleCloseContextMenu();
    }
  };

  const handleSendToRepeater = () => {
    if (contextMenu?.log) {
      onSendToRepeater(contextMenu.log);
      handleCloseContextMenu();
    }
  };

  const handleDelete = () => {
    if (contextMenu?.log) {
      onDelete(contextMenu.log);
      handleCloseContextMenu();
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small" style={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <StyledTableCell 
                key={column.id}
                style={{ width: column.width }}
              >
                {column.sortable ? (
                  <TableSortLabel
                    active={sortColumn === column.id}
                    direction={sortColumn === column.id ? sortDirection : 'asc'}
                    onClick={() => handleSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : column.label}
                {index < columns.length - 1 && (
                  <div
                    className={`resizer ${isResizing && resizingColumnRef === index ? 'isResizing' : ''}`}
                    onMouseDown={(e) => startResize(index, e)}
                  />
                )}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow 
              key={log.id}
              hover
              onClick={() => onSelectLog(selectedLog?.id === log.id ? null : log)}
              onContextMenu={(e) => handleContextMenu(e, log)}
              selected={selectedLog?.id === log.id}
              sx={{ cursor: 'pointer' }}
            >
              <StyledTableCell style={{ width: columns[0].width }}>{log.id}</StyledTableCell>
              <StyledTableCell style={{ width: columns[1].width }}>{new Date(log.timestamp).toLocaleString()}</StyledTableCell>
              <StyledTableCell style={{ width: columns[2].width }}>{log.method}</StyledTableCell>
              <StyledTableCell 
                style={{ 
                  width: columns[3].width,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {log.url}
              </StyledTableCell>
              <StyledTableCell style={{ width: columns[4].width }}>{log.status}</StyledTableCell>
              <StyledTableCell style={{ width: columns[5].width }}>
                <Button
                  size="small"
                  startIcon={<SendIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendToRepeater(log);
                  }}
                >
                  Send to Repeater
                </Button>
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleCopyUrl}>Copy URL</MenuItem>
        <MenuItem onClick={handleCopyAsCurl}>Copy as curl</MenuItem>
        <MenuItem onClick={handleSendToRepeater}>Send to repeater</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </TableContainer>
  );
};
