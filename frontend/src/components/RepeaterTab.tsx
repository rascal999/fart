import React, { useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { RepeaterStateReturn } from '../hooks/useRepeaterState';
import { RepeaterActionsReturn } from '../hooks/useRepeaterActions';
import RepeaterTabList from './RepeaterTabList';
import RepeaterTabContent from './RepeaterTabContent';
import RepeaterTabMenu from './RepeaterTabMenu';
import RepeaterNotifications from './RepeaterNotifications';

interface RepeaterTabProps {
  repeaterState: RepeaterStateReturn;
  repeaterActions: RepeaterActionsReturn;
}

const RepeaterTab: React.FC<RepeaterTabProps> = ({ repeaterState, repeaterActions }) => {
  const {
    state,
    error,
    success,
    isLoading,
    menuAnchor,
    importDialogOpen,
    importData,
    getActiveTab,
    updateState,
    setError,
    setSuccess,
    setMenuAnchor,
    setImportDialogOpen,
    setImportData,
  } = repeaterState;

  const {
    createNewTab,
    closeTab,
    closeAllTabs,
    renameTab,
    handleSend,
    handleRequestChange,
    handleConfigChange,
    handleClear,
    handleSort,
    handleExport,
    handleImport,
  } = repeaterActions;

  // Force a re-render when tabs change
  useEffect(() => {
    if (state.tabs.length > 0 && !state.activeTabId) {
      updateState({ activeTabId: state.tabs[0].id });
    }
  }, [state.tabs, state.activeTabId, updateState]);

  const handleCloseTab = (tabId: string) => {
    // If closing the active tab, switch to another tab first
    if (tabId === state.activeTabId) {
      const tabIndex = state.tabs.findIndex(tab => tab.id === tabId);
      const nextTab = state.tabs[tabIndex + 1] || state.tabs[tabIndex - 1];
      if (nextTab) {
        updateState({ activeTabId: nextTab.id });
      } else {
        updateState({ activeTabId: null });
      }
    }
    closeTab(tabId);
  };

  const handleCloseAllTabs = () => {
    updateState({ activeTabId: null });
    closeAllTabs();
    setMenuAnchor(null);
  };

  // Handle Ctrl+Enter keyboard shortcut
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (getActiveTab()) {
        handleSend();
      }
    }
  }, [getActiveTab, handleSend]);

  // Add and remove keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const activeTab = getActiveTab();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <RepeaterTabList
        tabs={state.tabs}
        activeTabId={state.activeTabId}
        onTabChange={(_, newValue) => updateState({ activeTabId: newValue })}
        onCreateTab={createNewTab}
        onMenuOpen={(e) => setMenuAnchor(e.currentTarget)}
        onCloseTab={handleCloseTab}
        onRenameTab={renameTab}
      />

      {activeTab && (
        <RepeaterTabContent
          tab={activeTab}
          isLoading={isLoading}
          onRequestChange={handleRequestChange}
          onConfigChange={handleConfigChange}
          onSend={handleSend}
          onClear={handleClear}
        />
      )}

      <RepeaterTabMenu
        anchorEl={menuAnchor}
        importDialogOpen={importDialogOpen}
        importData={importData}
        onClose={() => setMenuAnchor(null)}
        onSort={handleSort}
        onExport={handleExport}
        onImportClick={() => {
          setImportDialogOpen(true);
          setMenuAnchor(null);
        }}
        onImportDialogClose={() => setImportDialogOpen(false)}
        onImportDataChange={(e) => setImportData(e.target.value)}
        onImport={() => handleImport(importData)}
        onCloseAll={handleCloseAllTabs}
      />

      <RepeaterNotifications
        error={error}
        success={success}
        onErrorClose={() => setError(null)}
        onSuccessClose={() => setSuccess(null)}
      />
    </Box>
  );
};

export default RepeaterTab;
