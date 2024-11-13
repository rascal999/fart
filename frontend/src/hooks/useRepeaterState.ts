import { useState, useCallback } from 'react';
import { RepeaterState, RepeaterTab } from '../types/repeater';

export interface RepeaterStateReturn {
  state: RepeaterState;
  error: string | null;
  success: string | null;
  isLoading: boolean;
  menuAnchor: HTMLElement | null;
  importDialogOpen: boolean;
  importData: string;
  getActiveTab: () => RepeaterTab | undefined;
  updateState: (updates: Partial<RepeaterState>) => void;
  updateTabs: (updater: (tabs: RepeaterTab[]) => RepeaterTab[]) => void;
  updateActiveTab: (updater: (tab: RepeaterTab) => RepeaterTab) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setMenuAnchor: (anchor: HTMLElement | null) => void;
  setImportDialogOpen: (open: boolean) => void;
  setImportData: (data: string) => void;
}

export const useRepeaterState = (): RepeaterStateReturn => {
  const [state, setState] = useState<RepeaterState>({
    tabs: [],
    activeTabId: null
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState('');

  const getActiveTab = useCallback(() => {
    return state.tabs.find(tab => tab.id === state.activeTabId);
  }, [state.tabs, state.activeTabId]);

  const updateState = useCallback((updates: Partial<RepeaterState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      // Ensure we have a valid activeTabId if there are tabs
      if (newState.tabs.length > 0 && !newState.activeTabId) {
        newState.activeTabId = newState.tabs[0].id;
      }
      return newState;
    });
  }, []);

  const updateTabs = useCallback((updater: (tabs: RepeaterTab[]) => RepeaterTab[]) => {
    setState(prev => {
      const newTabs = updater(prev.tabs);
      // Ensure we have a valid activeTabId after updating tabs
      let newActiveTabId = prev.activeTabId;
      if (newTabs.length > 0 && (!newActiveTabId || !newTabs.find(tab => tab.id === newActiveTabId))) {
        newActiveTabId = newTabs[0].id;
      }
      return {
        ...prev,
        tabs: newTabs,
        activeTabId: newActiveTabId
      };
    });
  }, []);

  const updateActiveTab = useCallback((updater: (tab: RepeaterTab) => RepeaterTab) => {
    updateTabs(tabs => 
      tabs.map(tab => 
        tab.id === state.activeTabId ? updater(tab) : tab
      )
    );
  }, [state.activeTabId, updateTabs]);

  return {
    state,
    error,
    success,
    isLoading,
    menuAnchor,
    importDialogOpen,
    importData,
    getActiveTab,
    updateState,
    updateTabs,
    updateActiveTab,
    setError,
    setSuccess,
    setIsLoading,
    setMenuAnchor,
    setImportDialogOpen,
    setImportData,
  };
};
