import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { RepeaterRequestProps } from '../../types/repeater';
import { RepeaterRequestToolbar } from './RepeaterRequestToolbar';
import { RepeaterRequestEditor } from './RepeaterRequestEditor';
import { RepeaterRequestActions } from './RepeaterRequestActions';
import { RepeaterRequestContextMenu } from './RepeaterRequestContextMenu';

interface ContextMenu {
  mouseX: number;
  mouseY: number;
}

export const RepeaterRequest: React.FC<RepeaterRequestProps> = ({
  request,
  config,
  isLoading,
  onRequestChange,
  onConfigChange,
  onSend,
  onClear,
}) => {
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      onContextMenu={handleContextMenu}
    >
      <Box p={3} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Request
        </Typography>
        
        <RepeaterRequestToolbar
          config={config}
          onConfigChange={onConfigChange}
        />
        
        <RepeaterRequestEditor
          request={request}
          onRequestChange={onRequestChange}
        />
        
        <RepeaterRequestActions
          isLoading={isLoading}
          config={config}
          onConfigChange={onConfigChange}
          onSend={onSend}
          onClear={onClear}
        />
      </Box>

      <RepeaterRequestContextMenu
        contextMenu={contextMenu}
        request={request}
        config={config}
        onClose={handleCloseContextMenu}
      />
    </Paper>
  );
};

export * from './RepeaterRequestToolbar';
export * from './RepeaterRequestEditor';
export * from './RepeaterRequestActions';
export * from './RepeaterRequestContextMenu';
