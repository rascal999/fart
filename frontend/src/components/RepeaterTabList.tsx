import React, { useState } from 'react';
import { Tabs, Tab, Box, IconButton, TextField, ClickAwayListener } from '@mui/material';
import { Add as AddIcon, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { RepeaterTab } from '../types/repeater';

interface RepeaterTabListProps {
  tabs: RepeaterTab[];
  activeTabId: string | null;
  onTabChange: (event: React.SyntheticEvent, newValue: string) => void;
  onCreateTab: () => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onCloseTab: (tabId: string) => void;
  onRenameTab: (tabId: string, newName: string) => void;
}

const RepeaterTabList: React.FC<RepeaterTabListProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onCreateTab,
  onMenuOpen,
  onCloseTab,
  onRenameTab,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleCloseTab = (event: React.MouseEvent<SVGSVGElement | HTMLElement>, tabId: string) => {
    event.stopPropagation();
    onCloseTab(tabId);
  };

  const startEditing = (event: React.MouseEvent, tabId: string, currentName: string) => {
    event.stopPropagation();
    setEditingTabId(tabId);
    setEditValue(currentName);
  };

  const handleEditKeyDown = (event: React.KeyboardEvent, tabId: string) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (editValue.trim()) {
        onRenameTab(tabId, editValue);
        setEditingTabId(null);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setEditingTabId(null);
    }
  };

  const handleClickAway = () => {
    if (editingTabId) {
      setEditingTabId(null);
    }
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
      <Tabs
        value={activeTabId || false}
        onChange={onTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ flex: 1, minHeight: 48 }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                {editingTabId === tab.id ? (
                  <ClickAwayListener onClickAway={handleClickAway}>
                    <TextField
                      size="small"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, tab.id)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      sx={{ 
                        width: '150px',
                        '& .MuiInputBase-root': {
                          height: '28px',
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  </ClickAwayListener>
                ) : (
                  <span 
                    onDoubleClick={(e) => startEditing(e, tab.id, tab.name)}
                    style={{ userSelect: 'none' }}
                  >
                    {tab.name}
                  </span>
                )}
                <CloseIcon
                  onClick={(e) => handleCloseTab(e, tab.id)}
                  sx={{
                    fontSize: 16,
                    opacity: 0.7,
                    '&:hover': {
                      opacity: 1,
                      color: 'error.main'
                    }
                  }}
                />
              </Box>
            }
            sx={{ 
              minHeight: 48,
              textTransform: 'none',
              fontSize: '0.875rem'
            }}
          />
        ))}
      </Tabs>
      <Box sx={{ px: 1, display: 'flex', gap: 1 }}>
        <IconButton
          size="small"
          onClick={onCreateTab}
          sx={{ minWidth: 48, height: 48 }}
        >
          <AddIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={onMenuOpen}
          sx={{ minWidth: 48, height: 48 }}
        >
          <MenuIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default RepeaterTabList;
