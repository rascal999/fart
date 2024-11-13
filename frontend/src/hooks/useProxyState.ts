import { useState } from 'react';
import { ProxyLog } from '../services/types';
import { SortColumn, SortDirection } from '../types/proxy';

export interface ProxyState {
  filter: string;
  error: string | null;
  success: string | null;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  selectedLog: ProxyLog | null;
}

export interface ProxyStateReturn {
  state: ProxyState;
  setFilter: (filter: string) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setSortColumn: (column: SortColumn) => void;
  setSortDirection: (direction: SortDirection) => void;
  setSelectedLog: (log: ProxyLog | null) => void;
  handleSort: (column: SortColumn) => void;
}

export const useProxyState = (): ProxyStateReturn => {
  const [state, setState] = useState<ProxyState>({
    filter: '',
    error: null,
    success: null,
    sortColumn: 'timestamp',
    sortDirection: 'desc',
    selectedLog: null,
  });

  const setFilter = (filter: string) => setState(prev => ({ ...prev, filter }));
  const setError = (error: string | null) => setState(prev => ({ ...prev, error }));
  const setSuccess = (success: string | null) => setState(prev => ({ ...prev, success }));
  const setSortColumn = (sortColumn: SortColumn) => setState(prev => ({ ...prev, sortColumn }));
  const setSortDirection = (sortDirection: SortDirection) => setState(prev => ({ ...prev, sortDirection }));
  const setSelectedLog = (selectedLog: ProxyLog | null) => setState(prev => ({ ...prev, selectedLog }));

  const handleSort = (column: SortColumn) => {
    setState(prev => ({
      ...prev,
      sortDirection: prev.sortColumn === column && prev.sortDirection === 'asc' ? 'desc' : 'asc',
      sortColumn: column,
    }));
  };

  return {
    state,
    setFilter,
    setError,
    setSuccess,
    setSortColumn,
    setSortDirection,
    setSelectedLog,
    handleSort,
  };
};
