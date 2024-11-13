import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import HttpEditor from './HttpEditor';
import { EnhancedLogEntry } from '../types/logs';
import { LOG_TYPES, SOURCE_COLORS } from '../constants/logs';

interface RowProps {
  log: EnhancedLogEntry;
  isNew: boolean;
}

const getStatusColor = (status?: number | string) => {
  if (!status) return '';
  if (status === 'pending') return '#ffd93d';
  if (status === 'error') return '#ff6b6b';
  if (typeof status === 'number') {
    if (status >= 200 && status < 300) return '#69db7c';
    if (status >= 300 && status < 400) return '#ffd93d';
    if (status >= 400) return '#ff6b6b';
  }
  return '';
};

export const LogRow: React.FC<RowProps> = ({ log, isNew }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow 
        sx={{ 
          '& > *': { borderBottom: 'unset' },
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' }
        }}
        onClick={() => setOpen(!open)}
        className={isNew ? 'flash-highlight' : ''}
      >
        <TableCell padding="checkbox">
          <IconButton size="small">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{log.source === 'Proxy' ? log.proxyId : log.incrementalId}</TableCell>
        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
        <TableCell>
          <Chip 
            label={log.source}
            size="small"
            sx={{ 
              backgroundColor: SOURCE_COLORS[log.source],
              color: 'black',
              fontWeight: 'bold'
            }}
          />
        </TableCell>
        <TableCell sx={{ color: LOG_TYPES[log.type].color }}>{log.type}</TableCell>
        <TableCell>{log.details?.method || ''}</TableCell>
        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {log.details?.url || log.message}
        </TableCell>
        <TableCell sx={{ color: getStatusColor(log.details?.status) }}>
          {log.details?.status || ''}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Details
              </Typography>
              {log.details?.headers && (
                <>
                  <Typography variant="subtitle2">Headers:</Typography>
                  <HttpEditor
                    value={JSON.stringify(log.details.headers, null, 2)}
                    InputProps={{ readOnly: true }}
                  />
                </>
              )}
              {log.details?.content && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>Content:</Typography>
                  <HttpEditor
                    value={log.details.content}
                    InputProps={{ readOnly: true }}
                  />
                </>
              )}
              {!log.details && (
                <Typography color="textSecondary">
                  {log.message}
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
