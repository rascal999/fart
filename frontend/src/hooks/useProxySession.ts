import { useCallback } from 'react';
import sessionService from '../services/sessionService';
import { SessionData, Settings, ProxyLog } from '../services/types';

export interface ProxySessionReturn {
  exportSession: () => Promise<void>;
  importSession: () => Promise<void>;
}

const isValidSettings = (settings: any): settings is Settings => {
  return typeof settings === 'object' && settings !== null &&
    typeof settings.proxy_port === 'number' &&
    typeof settings.ui_port === 'number' &&
    typeof settings.debug_level === 'string' &&
    typeof settings.enable_filtering === 'boolean' &&
    Array.isArray(settings.filter_rules) &&
    typeof settings.upstream_proxy_enabled === 'boolean';
};

const isValidProxyLog = (log: any): log is ProxyLog => {
  return typeof log === 'object' && log !== null &&
    typeof log.id === 'number' &&
    typeof log.timestamp === 'string' &&
    typeof log.method === 'string' &&
    typeof log.url === 'string';
};

const isValidSessionData = (data: any): data is SessionData => {
  return typeof data === 'object' && data !== null &&
    Array.isArray(data.logs) &&
    data.logs.every(isValidProxyLog) &&
    isValidSettings(data.settings) &&
    typeof data.timestamp === 'string';
};

export const useProxySession = (
  setError: (error: string | null) => void,
  setSuccess: (success: string | null) => void,
  fetchLogs: () => Promise<void>
): ProxySessionReturn => {
  const exportSession = useCallback(async () => {
    try {
      const response = await sessionService.exportSession();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fart-session-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSuccess('Session exported successfully');
    } catch (err) {
      setError('Failed to export session');
    }
  }, [setError, setSuccess]);

  const importSession = useCallback(async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const data = JSON.parse(e.target?.result as string);
              
              if (!isValidSessionData(data)) {
                setError('Failed to import session: Invalid session data structure');
                return;
              }

              await sessionService.importSession(data);
              await fetchLogs();
              setSuccess('Session imported successfully');
            } catch (err) {
              if (err instanceof SyntaxError) {
                setError('Failed to import session: Invalid JSON format');
              } else {
                setError('Failed to import session: ' + (err instanceof Error ? err.message : 'Unknown error'));
              }
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    } catch (err) {
      setError('Failed to import session');
    }
  }, [setError, setSuccess, fetchLogs]);

  return {
    exportSession,
    importSession
  };
};
