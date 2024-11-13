import React, { useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ProxyLog } from '../types/proxy';  // Using local type definition
import { ProxyToolbar } from './ProxyToolbar';
import { ProxyTable } from './ProxyTable';
import { ProxyDetails } from './ProxyDetails';
import { filterProxyLogs, sortProxyLogs, prepareRepeaterRequest } from '../utils/proxyUtils';
import { RepeaterStateReturn } from '../hooks/useRepeaterState';
import { RepeaterActionsReturn } from '../hooks/useRepeaterActions';
import { useProxyState } from '../hooks/useProxyState';
import { useProxyLogs } from '../hooks/useProxyLogs';
import { useProxySession } from '../hooks/useProxySession';
import ProxyNotifications from './ProxyNotifications';

interface ProxyTabProps {
  repeaterState: RepeaterStateReturn;
  repeaterActions: RepeaterActionsReturn;
}

const ProxyTab: React.FC<ProxyTabProps> = ({ repeaterState, repeaterActions }) => {
  const navigate = useNavigate();
  
  const {
    state: {
      filter,
      error,
      success,
      sortColumn,
      sortDirection,
      selectedLog
    },
    setFilter,
    setError,
    setSuccess,
    setSelectedLog,
    handleSort
  } = useProxyState();

  const {
    logs,
    clearLogs,
    deleteLog,
    fetchLogs,
    stopPolling,
    startPolling,
    isLoading
  } = useProxyLogs(setError, setSuccess, setSelectedLog, selectedLog);

  const {
    exportSession,
    importSession
  } = useProxySession(setError, setSuccess, fetchLogs);

  const handleSendToRepeater = useCallback((log: ProxyLog) => {
    try {
      // Stop polling before navigation
      stopPolling();
      
      const repeaterRequest = prepareRepeaterRequest(log);
      const url = new URL(log.url);
      
      // Create a new tab with the request data
      const newTabId = repeaterActions.createNewTab({
        method: log.method,
        url: log.url,
        headers: repeaterRequest.raw_request,
        body: log.request_content || '',
        protocol: url.protocol.replace(':', '') as 'http' | 'https',
        host: url.hostname,
        port: url.port || (url.protocol === 'https:' ? '443' : '80')
      });
      
      // Update state to set the new tab as active
      repeaterState.updateState({ activeTabId: newTabId });
      
      setSuccess('Request sent to Repeater');
      navigate('/repeater');
    } catch (err) {
      console.error('Failed to send to repeater:', err);
      setError('Failed to send request to Repeater');
      // Restart polling on error
      startPolling();
    }
  }, [repeaterActions, repeaterState, setSuccess, setError, navigate, stopPolling, startPolling]);

  // Global keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'r' && selectedLog) {
        event.preventDefault();
        handleSendToRepeater(selectedLog);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedLog, handleSendToRepeater]);

  const filteredAndSortedLogs = sortProxyLogs(
    filterProxyLogs(logs, filter),
    sortColumn,
    sortDirection
  );

  return (
    <Box p={3}>
      <ProxyToolbar
        filter={filter}
        onFilterChange={setFilter}
        onExportSession={exportSession}
        onImportSession={importSession}
        onClearLogs={clearLogs}
        isLoading={isLoading}
      />
      
      <ProxyTable
        logs={filteredAndSortedLogs}
        selectedLog={selectedLog}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        onSelectLog={setSelectedLog}
        onSendToRepeater={handleSendToRepeater}
        onDelete={deleteLog}
      />

      {selectedLog && <ProxyDetails log={selectedLog} />}

      <ProxyNotifications
        error={error}
        success={success}
        onErrorClose={() => setError(null)}
        onSuccessClose={() => setSuccess(null)}
      />
    </Box>
  );
};

export default ProxyTab;
