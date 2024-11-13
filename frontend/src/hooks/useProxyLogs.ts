import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ProxyLog } from '../types/proxy';  // Using local type definition
import proxyService from '../services/proxyService';

export interface ProxyLogsReturn {
  logs: ProxyLog[];
  fetchLogs: () => Promise<void>;
  clearLogs: () => Promise<void>;
  deleteLog: (log: ProxyLog) => Promise<void>;
  isLoading: boolean;
  stopPolling: () => void;
  startPolling: () => void;
}

export const useProxyLogs = (
  setError: (error: string | null) => void,
  setSuccess: (success: string | null) => void,
  setSelectedLog: (log: ProxyLog | null) => void,
  selectedLog: ProxyLog | null = null
): ProxyLogsReturn => {
  const [logs, setLogs] = useState<ProxyLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingEnabled = useRef(true);
  const location = useLocation();

  const fetchLogs = useCallback(async () => {
    // Skip if not on proxy tab
    if (location.pathname !== '/') return;

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      if (!isPollingEnabled.current) return;

      const response = await proxyService.getLogs();
      if (isPollingEnabled.current && location.pathname === '/') {
        setLogs(response.data);
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError' && location.pathname === '/') {
        console.error('Error fetching logs:', error);
        setError(error?.message || 'Failed to fetch logs');
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, [setError, location.pathname]);

  const clearLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      await proxyService.clearLogs();
      setLogs([]);
      setSelectedLog(null);
      setSuccess('Logs cleared successfully');
    } catch (error: any) {
      setError(error?.message || 'Failed to clear logs');
    } finally {
      setIsLoading(false);
    }
  }, [setError, setSuccess, setSelectedLog]);

  const deleteLog = useCallback(async (log: ProxyLog) => {
    try {
      setIsLoading(true);
      await proxyService.deleteLog(log.id);
      setLogs(prevLogs => prevLogs.filter(l => l.id !== log.id));
      if (selectedLog && log.id === selectedLog.id) {
        setSelectedLog(null);
      }
      setSuccess('Log deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      setError(error?.message || 'Failed to delete log');
    } finally {
      setIsLoading(false);
    }
  }, [setError, setSuccess, setSelectedLog, selectedLog]);

  const stopPolling = useCallback(() => {
    isPollingEnabled.current = false;
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!isPollingEnabled.current && location.pathname === '/') {
      isPollingEnabled.current = true;
      fetchLogs();
      pollingIntervalRef.current = setInterval(fetchLogs, 2000);
    }
  }, [fetchLogs, location.pathname]);

  // Handle route changes
  useEffect(() => {
    if (location.pathname === '/') {
      startPolling();
    } else {
      stopPolling();
    }
  }, [location.pathname, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    logs,
    fetchLogs,
    clearLogs,
    deleteLog,
    isLoading,
    stopPolling,
    startPolling
  };
};
