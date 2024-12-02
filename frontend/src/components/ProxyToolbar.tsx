import React, { useState } from 'react';
import { Box, Button, TextField, IconButton, Menu, MenuItem, Checkbox, Tooltip } from '@mui/material';
import { 
  Save as SaveIcon, 
  Upload as UploadIcon, 
  Clear as ClearIcon,
  ViewColumn as ViewColumnIcon 
} from '@mui/icons-material';
import { ProxyToolbarProps } from '../types/proxy';

export const ProxyToolbar: React.FC<ProxyToolbarProps> = ({
  filter,
  onFilterChange,
  onExportSession,
  onImportSession,
  onClearLogs,
  columns,
  onColumnVisibilityChange,
}) => {
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);

  const handleColumnMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
  };

  return (
    <Box mb={2} display="flex" gap={2} alignItems="center">
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
      <Box ml="auto" display="flex" gap={1} alignItems="center">
        <TextField
          label="Filter"
          variant="outlined"
          size="small"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
        />
        <Tooltip title="Show/Hide Columns">
          <IconButton
            size="small"
            onClick={handleColumnMenuOpen}
          >
            <ViewColumnIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={handleColumnMenuClose}
      >
        {columns
          .filter(col => col.id !== 'actions') // Don't allow hiding actions column
          .map(column => (
            <MenuItem 
              key={column.id}
              onClick={() => onColumnVisibilityChange(column.id, !column.visible)}
              className={column.priority ? 'priority' : ''}
            >
              <Checkbox 
                checked={column.visible}
                size="small"
                disabled={column.priority} // Don't allow hiding priority columns
                onClick={(e) => e.stopPropagation()} // Prevent menu item click when clicking checkbox
              />
              {column.label}
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
};
