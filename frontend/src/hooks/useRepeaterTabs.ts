import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RepeaterTab, Request, RequestConfig } from '../types/repeater';
import { getDefaultRequest, getDefaultConfig } from '../utils/repeaterUtils';

export interface RepeaterTabsReturn {
  createNewTab: (initialRequest?: Partial<Request & RequestConfig>) => string;
  updateTabName: (tabId: string, domain: string) => void;
  renameTab: (tabId: string, newName: string) => void;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  handleSort: () => void;
}

export const useRepeaterTabs = (
  updateTabs: (updater: (tabs: RepeaterTab[]) => RepeaterTab[]) => void,
  setMenuAnchor: (anchor: HTMLElement | null) => void,
): RepeaterTabsReturn => {
  const createNewTab = useCallback((initialRequest?: Partial<Request & RequestConfig>) => {
    const id = uuidv4();
    const newTab: RepeaterTab = {
      id,
      name: `${id.slice(0, 8)}-new`,
      domain: initialRequest?.host || '',
      request: {
        ...getDefaultRequest(),
        ...(initialRequest || {})
      },
      config: {
        ...getDefaultConfig(),
        ...(initialRequest || {})
      },
      response: null
    };

    updateTabs(tabs => [...tabs, newTab]);
    return newTab.id;
  }, [updateTabs]);

  const updateTabName = useCallback((tabId: string, domain: string) => {
    updateTabs(tabs => 
      tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, name: `${tab.id.slice(0, 8)}-${domain}`, domain }
          : tab
      )
    );
  }, [updateTabs]);

  const renameTab = useCallback((tabId: string, newName: string) => {
    if (!newName.trim()) return;
    updateTabs(tabs =>
      tabs.map(tab =>
        tab.id === tabId
          ? { ...tab, name: newName.trim() }
          : tab
      )
    );
  }, [updateTabs]);

  const closeTab = useCallback((tabId: string) => {
    updateTabs(tabs => tabs.filter(tab => tab.id !== tabId));
  }, [updateTabs]);

  const closeAllTabs = useCallback(() => {
    updateTabs(() => []);
  }, [updateTabs]);

  const handleSort = useCallback(() => {
    updateTabs(tabs => [...tabs].sort((a, b) => a.name.localeCompare(b.name)));
    setMenuAnchor(null);
  }, [updateTabs, setMenuAnchor]);

  return {
    createNewTab,
    updateTabName,
    renameTab,
    closeTab,
    closeAllTabs,
    handleSort
  };
};
