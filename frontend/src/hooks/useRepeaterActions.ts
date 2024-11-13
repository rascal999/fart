import { RepeaterTab, Request, RequestConfig } from '../types/repeater';
import { useRepeaterTabs, RepeaterTabsReturn } from './useRepeaterTabs';
import { useRepeaterRequest, RepeaterRequestReturn } from './useRepeaterRequest';
import { useRepeaterSession, RepeaterSessionReturn } from './useRepeaterSession';

export interface RepeaterActionsReturn extends 
  RepeaterTabsReturn,
  RepeaterRequestReturn,
  RepeaterSessionReturn {}

export const useRepeaterActions = (
  getActiveTab: () => RepeaterTab | undefined,
  updateTabs: (updater: (tabs: RepeaterTab[]) => RepeaterTab[]) => void,
  updateActiveTab: (updater: (tab: RepeaterTab) => RepeaterTab) => void,
  setError: (error: string | null) => void,
  setSuccess: (success: string | null) => void,
  setIsLoading: (loading: boolean) => void,
  setMenuAnchor: (anchor: HTMLElement | null) => void,
  setImportDialogOpen: (open: boolean) => void,
  setImportData: (data: string) => void,
): RepeaterActionsReturn => {
  const tabActions = useRepeaterTabs(
    updateTabs,
    setMenuAnchor
  );

  const requestActions = useRepeaterRequest(
    getActiveTab,
    updateActiveTab,
    tabActions.updateTabName,
    setError,
    setSuccess,
    setIsLoading
  );

  const sessionActions = useRepeaterSession(
    getActiveTab,
    updateTabs,
    setError,
    setSuccess,
    setMenuAnchor,
    setImportDialogOpen,
    setImportData
  );

  return {
    ...tabActions,
    ...requestActions,
    ...sessionActions
  };
};
