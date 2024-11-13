import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import loggingService from '../services/loggingService';
import proxyService from '../services/proxyService';
import { LogSource, LogEntry } from '../services/types';
import { LogToolbar } from './LogToolbar';
import { LogFilter } from './LogFilter';
import { LogTable } from './LogTable';
import { sortLogs, filterLogs, exportLogs } from '../utils/logUtils';
import { EnhancedLogEntry, FilterOptions, SortField, SortDirection } from '../types/logs';

const LogTab: React.FC = () => {
  const [logs, setLogs] = useState<EnhancedLogEntry[]>([]);
  const [newLogIds, setNewLogIds] = useState<Set<string>>(new Set());
  const [quickFilter, setQuickFilter] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    method: '',
    url: '',
    status: '',
    type: '',
    source: ''
  });
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const initialized = useRef(false);
  const seenLogIds = useRef(new Set<string>());
  const nextId = useRef(1);
  const nextProxyId = useRef(1);

  const fetchLogs = async () => {
    try {
      await proxyService.getLogs();
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = loggingService.subscribe((entry: LogEntry) => {
      if (!seenLogIds.current.has(entry.id)) {
        seenLogIds.current.add(entry.id);
        const enhancedEntry: EnhancedLogEntry = {
          ...entry,
          incrementalId: nextId.current++,
          timestamp: new Date().toISOString(),
          proxyId: entry.source === 'Proxy' ? String(nextProxyId.current++) : undefined
        };
        setLogs(prev => [...prev, enhancedEntry]);
        setNewLogIds(prev => new Set(prev).add(entry.id));
        
        setTimeout(() => {
          setNewLogIds(prev => {
            const next = new Set(prev);
            next.delete(entry.id);
            return next;
          });
        }, 2000);
      }
    });

    if (!initialized.current) {
      loggingService.log({
        type: 'info',
        source: 'System' as LogSource,
        message: 'Log system initialized'
      });
      initialized.current = true;
    }

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleClearLogs = async () => {
    try {
      await proxyService.clearLogs();
      setLogs([]);
      setNewLogIds(new Set());
      seenLogIds.current.clear();
      nextId.current = 1;
      nextProxyId.current = 1;
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedLogs = sortLogs(
    filterLogs(logs, quickFilter, filterOptions),
    sortField,
    sortDirection
  );

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <LogToolbar
        filter={quickFilter}
        onFilterChange={setQuickFilter}
        onAdvancedFilterClick={() => setFilterDialogOpen(true)}
        onRefreshClick={fetchLogs}
        onClearClick={handleClearLogs}
        onExportClick={() => exportLogs(logs)}
      />
      
      <LogTable
        logs={filteredAndSortedLogs}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        newLogIds={newLogIds}
      />

      <LogFilter
        open={filterDialogOpen}
        filterOptions={filterOptions}
        onClose={() => setFilterDialogOpen(false)}
        onFilterChange={setFilterOptions}
      />
    </Box>
  );
};

export default LogTab;
