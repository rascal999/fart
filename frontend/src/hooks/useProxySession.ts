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
    typeof settings.upstream_proxy_enabled === 'boolean' &&
    (settings.upstream_proxy_host === null || typeof settings.upstream_proxy_host === 'string') &&
    (settings.upstream_proxy_port === null || typeof settings.upstream_proxy_port === 'number') &&
    typeof settings.upstream_proxy_auth === 'boolean' &&
    (settings.upstream_proxy_username === null || typeof settings.upstream_proxy_username === 'string') &&
    (settings.upstream_proxy_password === null || typeof settings.upstream_proxy_password === 'string');
};

const isValidProxyLog = (log: any): log is ProxyLog => {
  return typeof log === 'object' && log !== null &&
    typeof log.id === 'number' &&
    typeof log.timestamp === 'string' &&
    typeof log.method === 'string' &&
    typeof log.url === 'string' &&
    (log.status === undefined || typeof log.status === 'number' || log.status === 'pending' || log.status === 'error') &&
    (log.request_headers === undefined || (typeof log.request_headers === 'object' && log.request_headers !== null)) &&
    (log.request_content === undefined || typeof log.request_content === 'string') &&
    (log.response_headers === undefined || (typeof log.response_headers === 'object' && log.response_headers !== null)) &&
    (log.response_content === undefined || typeof log.response_content === 'string') &&
    (log.error === undefined || typeof log.error === 'string');
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
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const content = e.target?.result as string;
            const data = JSON.parse(content);
            
            if (!isValidSessionData(data)) {
              setError('Failed to import session: Invalid session data structure');
              return;
            }

            try {
              await sessionService.importSession(data);
              await fetchLogs();
              setSuccess('Session imported successfully');
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Unknown error';
              setError(`Failed to import session: ${message}`);
            }
          } catch (err) {
            if (err instanceof SyntaxError) {
              setError('Failed to import session: Invalid JSON format');
            } else {
              const message = err instanceof Error ? err.message : 'Unknown error';
              setError(`Failed to import session: ${message}`);
            }
          }
        };
        reader.readAsText(file);
      };
      input.click();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to import session: ${message}`);
    }
  }, [setError, setSuccess, fetchLogs]);

  return {
    exportSession,
    importSession
  };
};
