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
  // Validate required fields
  if (!(typeof log === 'object' && log !== null &&
        typeof log.id === 'number' &&
        typeof log.timestamp === 'string')) {
    return false;
  }

  // Validate method and url (can be at top level or in request object)
  const hasTopLevelMethod = typeof log.method === 'string';
  const hasTopLevelUrl = typeof log.url === 'string';
  const hasRequestMethodUrl = log.request && 
    typeof log.request.method === 'string' &&
    typeof log.request.url === 'string';

  if (!((hasTopLevelMethod && hasTopLevelUrl) || hasRequestMethodUrl)) {
    return false;
  }

  // Validate optional fields
  if (log.status !== undefined && 
      !(typeof log.status === 'number' || log.status === 'pending' || log.status === 'error')) {
    return false;
  }

  if (log.content_length !== undefined && typeof log.content_length !== 'number') {
    return false;
  }

  if (log.error !== undefined && typeof log.error !== 'string') {
    return false;
  }

  // Validate optional request object
  if (log.request !== undefined) {
    if (!(typeof log.request === 'object' && log.request !== null &&
          typeof log.request.method === 'string' &&
          typeof log.request.url === 'string' &&
          typeof log.request.headers === 'object' && log.request.headers !== null &&
          (log.request.content === null || typeof log.request.content === 'string'))) {
      return false;
    }
  }

  // Validate optional response object
  if (log.response !== undefined) {
    if (!(typeof log.response === 'object' && log.response !== null &&
          typeof log.response.status_code === 'number' &&
          typeof log.response.headers === 'object' && log.response.headers !== null &&
          (log.response.content === null || typeof log.response.content === 'string'))) {
      return false;
    }
  }

  return true;
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
