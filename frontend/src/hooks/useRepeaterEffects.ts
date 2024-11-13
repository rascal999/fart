import { useEffect } from 'react';
import { RepeaterState, RepeaterTab } from '../types/repeater';

// Type for serializable state (only what we need to persist)
interface SerializableRepeaterState {
  tabs: Array<{
    id: string;
    name: string;
    domain: string;
    request: {
      method: string;
      url: string;
      headers: string;
      body: string;
    };
    config: {
      protocol: 'http' | 'https';
      port: string;
      host: string;
      followRedirects: boolean;
    };
    response: {
      status: number;
      statusText: string;
      headers: Record<string, string>;
      body: string;
    } | null;
  }>;
  activeTabId: string | null;
}

export const useRepeaterEffects = (
  state: RepeaterState,
  updateState: (updates: Partial<RepeaterState>) => void,
  createNewTab: () => string,
  setError: (error: string | null) => void
) => {
  // Create initial tab if none exist
  useEffect(() => {
    if (!state.tabs || state.tabs.length === 0) {
      const newTabId = createNewTab();
      updateState({ activeTabId: newTabId });
    }
  }, [state.tabs, createNewTab, updateState]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (state.tabs && state.tabs.length > 0) {
      try {
        // Create a clean version of state for serialization
        const serializableState: SerializableRepeaterState = {
          tabs: state.tabs.map(tab => ({
            id: tab.id,
            name: tab.name,
            domain: tab.domain,
            request: {
              method: tab.request.method,
              url: tab.request.url,
              headers: tab.request.headers,
              body: tab.request.body
            },
            config: {
              protocol: tab.config.protocol,
              port: tab.config.port,
              host: tab.config.host,
              followRedirects: tab.config.followRedirects
            },
            response: tab.response ? {
              status: tab.response.status,
              statusText: tab.response.statusText,
              headers: { ...tab.response.headers },
              body: tab.response.body
            } : null
          })),
          activeTabId: state.activeTabId
        };
        localStorage.setItem('repeaterState', JSON.stringify(serializableState));
      } catch (err) {
        console.error('Failed to save state:', err);
      }
    }
  }, [state]);

  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('repeaterState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState) as SerializableRepeaterState;
        if (parsed.tabs && Array.isArray(parsed.tabs)) {
          updateState(parsed);
        }
      } catch (err) {
        console.error('Failed to load saved state:', err);
        localStorage.removeItem('repeaterState'); // Clear corrupted state
      }
    }
  }, [updateState]);
};
