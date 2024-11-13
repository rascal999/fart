import { useCallback } from 'react';
import repeaterService from '../services/repeaterService';
import { Request, RequestConfig, RepeaterTab } from '../types/repeater';
import { getDefaultRequest, getDefaultConfig, formatRequestForApi } from '../utils/repeaterUtils';

export interface RepeaterRequestReturn {
  handleSend: () => Promise<void>;
  handleRequestChange: (field: keyof Request) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleConfigChange: (updates: Partial<RequestConfig>) => void;
  handleClear: () => void;
}

export const useRepeaterRequest = (
  getActiveTab: () => RepeaterTab | undefined,
  updateActiveTab: (updater: (tab: RepeaterTab) => RepeaterTab) => void,
  updateTabName: (tabId: string, domain: string) => void,
  setError: (error: string | null) => void,
  setSuccess: (success: string | null) => void,
  setIsLoading: (loading: boolean) => void,
): RepeaterRequestReturn => {
  const handleSend = useCallback(async () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;

    if (!activeTab.config.host) {
      setError('Host is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formattedRequest = formatRequestForApi(activeTab.request, activeTab.config);
      const result = await repeaterService.sendRequest(formattedRequest);
      
      const responseData = result.data;
      if (responseData) {
        const response = {
          status: responseData.status,
          statusText: responseData.statusText || String(responseData.status),
          headers: responseData.headers || {},
          body: responseData.body || ''
        };

        updateActiveTab(tab => ({ ...tab, response }));

        // Update tab name with domain if not already set
        if (!activeTab.domain) {
          updateTabName(activeTab.id, activeTab.config.host);
        }

        setSuccess('Request sent successfully');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Request error:', err);
      let errorMessage = 'Failed to send request';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getActiveTab, updateActiveTab, updateTabName, setError, setSuccess, setIsLoading]);

  const handleRequestChange = useCallback((field: keyof Request) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateActiveTab(tab => ({
      ...tab,
      request: { ...tab.request, [field]: event.target.value }
    }));
  }, [updateActiveTab]);

  const handleConfigChange = useCallback((updates: Partial<RequestConfig>) => {
    updateActiveTab(tab => ({
      ...tab,
      config: { ...tab.config, ...updates }
    }));
  }, [updateActiveTab]);

  const handleClear = useCallback(() => {
    updateActiveTab(tab => ({
      ...tab,
      request: getDefaultRequest(),
      config: getDefaultConfig(),
      response: null
    }));
    setSuccess('Request and response cleared');
  }, [updateActiveTab, setSuccess]);

  return {
    handleSend,
    handleRequestChange,
    handleConfigChange,
    handleClear
  };
};
