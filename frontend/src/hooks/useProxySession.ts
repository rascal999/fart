import { useCallback } from 'react';
import sessionService from '../services/sessionService';
import { SessionData } from '../services/types';

export interface ProxySessionReturn {
  exportSession: () => Promise<void>;
  importSession: () => Promise<void>;
}

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
              const sessionData = JSON.parse(e.target?.result as string) as SessionData;
              await sessionService.importSession(sessionData);
              await fetchLogs();
              setSuccess('Session imported successfully');
            } catch (err) {
              setError('Failed to import session: Invalid file format');
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
