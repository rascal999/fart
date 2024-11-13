import React from 'react';
import { Box, Button, TextField } from '@mui/material';
import { 
  Save as SaveIcon, 
  Upload as UploadIcon, 
  Clear as ClearIcon 
} from '@mui/icons-material';
import { ProxyToolbarProps } from '../types/proxy';

export const ProxyToolbar: React.FC<ProxyToolbarProps> = ({
  filter,
  onFilterChange,
  onExportSession,
  onImportSession,
  onClearLogs,
}) => {
  return (
    <Box mb={2} display="flex" gap={2}>
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={onExportSession}
      >
        Export Session
      </Button>
      <Button
        variant="contained"
        startIcon={<UploadIcon />}
        onClick={onImportSession}
      >
        Import Session
      </Button>
      <Button
        variant="contained"
        color="error"
        startIcon={<ClearIcon />}
        onClick={onClearLogs}
      >
        Clear Logs
      </Button>
      <TextField
        label="Filter"
        variant="outlined"
        size="small"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        sx={{ ml: 'auto' }}
      />
    </Box>
  );
};
