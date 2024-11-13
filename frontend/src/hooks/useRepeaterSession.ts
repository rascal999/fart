import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RepeaterTab } from '../types/repeater';

export interface RepeaterSessionReturn {
  handleExport: () => void;
  handleImport: (importData: string) => void;
}

export const useRepeaterSession = (
  getActiveTab: () => RepeaterTab | undefined,
  updateTabs: (updater: (tabs: RepeaterTab[]) => RepeaterTab[]) => void,
  setError: (error: string | null) => void,
  setSuccess: (success: string | null) => void,
  setMenuAnchor: (anchor: HTMLElement | null) => void,
  setImportDialogOpen: (open: boolean) => void,
  setImportData: (data: string) => void,
): RepeaterSessionReturn => {
  const handleExport = useCallback(() => {
    const tabs = getActiveTab()?.id ? [getActiveTab()] : [];
    const dataStr = JSON.stringify(tabs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'repeater-tabs.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setMenuAnchor(null);
  }, [getActiveTab, setMenuAnchor]);

  const handleImport = useCallback((importData: string) => {
    try {
      const importedTabs = JSON.parse(importData);
      if (Array.isArray(importedTabs)) {
        updateTabs(tabs => [
          ...tabs,
          ...importedTabs.map(tab => ({ ...tab, id: uuidv4() }))
        ]);
        setSuccess('Tabs imported successfully');
      }
    } catch (err) {
      setError('Failed to import tabs: Invalid JSON format');
    }
    setImportDialogOpen(false);
    setImportData('');
  }, [updateTabs, setError, setSuccess, setImportDialogOpen, setImportData]);

  return {
    handleExport,
    handleImport
  };
};
