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
  const lastFetchTime = useRef<number>(0);

  const fetchLogs = useCallback(async () => {
    // Debug logging
    console.log('Fetching logs:', {
      pathname: location.pathname,
      isPollingEnabled: isPollingEnabled.current,
      lastFetchTime: new Date(lastFetchTime.current).toISOString()
    });

    // Skip if not on proxy tab
    if (location.pathname !== '/') {
      console.log('Skipping fetch - not on proxy tab');
      return;
    }

    // Throttle requests to prevent overwhelming the server
    const now = Date.now();
    if (now - lastFetchTime.current < 1000) { // Minimum 1 second between requests
      console.log('Throttling fetch request');
      return;
    }
    lastFetchTime.current = now;

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      console.log('Aborting previous request');
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      if (!isPollingEnabled.current) {
        console.log('Polling is disabled, skipping fetch');
        return;
      }

      setIsLoading(true);
      const response = await proxyService.getLogs();
      
      if (isPollingEnabled.current && location.pathname === '/') {
        console.log('Setting logs:', response.data);
        setLogs(response.data);
      } else {
        console.log('Skipping log update - polling disabled or route changed');
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError' && location.pathname === '/') {
        console.error('Error fetching logs:', error);
        setError(error?.message || 'Failed to fetch logs');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [setError, location.pathname]);

  const clearLogs = useCallback(async () => {
    try {
      console.log('Clearing logs');
      setIsLoading(true);
      await proxyService.clearLogs();
      setLogs([]);
      setSelectedLog(null);
      setSuccess('Logs cleared successfully');
    } catch (error: any) {
      console.error('Error clearing logs:', error);
      setError(error?.message || 'Failed to clear logs');
    } finally {
      setIsLoading(false);
    }
  }, [setError, setSuccess, setSelectedLog]);

  const deleteLog = useCallback(async (log: ProxyLog) => {
    try {
      console.log('Deleting log:', log.id);
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
    console.log('Stopping polling');
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
    console.log('Starting polling:', {
      currentlyEnabled: isPollingEnabled.current,
      pathname: location.pathname
    });
    
    if (!isPollingEnabled.current && location.pathname === '/') {
      isPollingEnabled.current = true;
      // Immediate fetch
      fetchLogs();
      // Start interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      pollingIntervalRef.current = setInterval(fetchLogs, 2000);
      console.log('Polling started');
    }
  }, [fetchLogs, location.pathname]);

  // Handle route changes
  useEffect(() => {
    console.log('Route changed:', location.pathname);
    if (location.pathname === '/') {
      startPolling();
    } else {
      stopPolling();
    }
  }, [location.pathname, startPolling, stopPolling]);

  // Start polling on mount if we're on the proxy tab
  useEffect(() => {
    console.log('Component mounted');
    if (location.pathname === '/') {
      startPolling();
    }
    return () => {
      console.log('Component unmounting');
      stopPolling();
    };
  }, [location.pathname, startPolling, stopPolling]);

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
