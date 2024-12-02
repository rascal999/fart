import React from 'react';
import { TableRow, Button } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { StyledTableCell, HttpMethodChip } from './styles';
import { ProxyLog, Column } from '../../types/proxy';

interface ProxyTableRowProps {
  log: ProxyLog;
  columns: Column[];
  isSelected: boolean;
  onSelect: (log: ProxyLog) => void;
  onContextMenu: (event: React.MouseEvent, log: ProxyLog) => void;
  onSendToRepeater: (log: ProxyLog) => void;
}

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

const formatBytes = (bytes?: number): string => {
  if (bytes === undefined) return '-';
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const ProxyTableRow: React.FC<ProxyTableRowProps> = ({
  log,
  columns,
  isSelected,
  onSelect,
  onContextMenu,
  onSendToRepeater,
}) => {
  const getCellContent = (column: Column) => {
    switch (column.id) {
      case 'id':
        return log.id;
      case 'timestamp':
        return formatTimestamp(log.timestamp);
      case 'method':
        return <HttpMethodChip method={log.method}>{log.method}</HttpMethodChip>;
      case 'url':
        return log.url;
      case 'status':
        return log.status;
      case 'content_length':
        return formatBytes(log.content_length);
      case 'actions':
        return (
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
        );
      default:
        return null;
    }
  };

  return (
    <TableRow 
      hover
      onClick={() => onSelect(log)}
      onContextMenu={(e) => onContextMenu(e, log)}
      selected={isSelected}
      sx={{ cursor: 'pointer' }}
    >
      {columns.map((column) => (
        <StyledTableCell
          key={column.id}
          style={{ 
            width: column.width,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {getCellContent(column)}
        </StyledTableCell>
      ))}
    </TableRow>
  );
};
