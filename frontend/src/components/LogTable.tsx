import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
} from '@mui/material';
import { LogRow } from './LogRow';
import { EnhancedLogEntry, SortField, SortDirection } from '../types/logs';

interface LogTableProps {
  logs: EnhancedLogEntry[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  newLogIds: Set<string>;
}

export const LogTable: React.FC<LogTableProps> = ({
  logs,
  sortField,
  sortDirection,
  onSort,
  newLogIds,
}) => {
  return (
    <TableContainer component={Paper} sx={{ flex: 1 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            <TableCell>
              <TableSortLabel
                active={sortField === 'id'}
                direction={sortField === 'id' ? sortDirection : 'asc'}
                onClick={() => onSort('id')}
              >
                ID
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'timestamp'}
                direction={sortField === 'timestamp' ? sortDirection : 'asc'}
                onClick={() => onSort('timestamp')}
              >
                Timestamp
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'source'}
                direction={sortField === 'source' ? sortDirection : 'asc'}
                onClick={() => onSort('source')}
              >
                Source
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'type'}
                direction={sortField === 'type' ? sortDirection : 'asc'}
                onClick={() => onSort('type')}
              >
                Type
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'method'}
                direction={sortField === 'method' ? sortDirection : 'asc'}
                onClick={() => onSort('method')}
              >
                Method
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'url'}
                direction={sortField === 'url' ? sortDirection : 'asc'}
                onClick={() => onSort('url')}
              >
                URL/Message
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'status'}
                direction={sortField === 'status' ? sortDirection : 'asc'}
                onClick={() => onSort('status')}
              >
                Status
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <LogRow 
              key={`${log.id}-${newLogIds.has(log.id)}`} 
              log={log} 
              isNew={newLogIds.has(log.id)}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
