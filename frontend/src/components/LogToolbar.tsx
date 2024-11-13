import React from 'react';
import {
  Stack,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

interface LogToolbarProps {
  filter: string;
  onFilterChange: (value: string) => void;
  onAdvancedFilterClick: () => void;
  onRefreshClick: () => void;
  onClearClick: () => void;
  onExportClick: () => void;
}

export const LogToolbar: React.FC<LogToolbarProps> = ({
  filter,
  onFilterChange,
  onAdvancedFilterClick,
  onRefreshClick,
  onClearClick,
  onExportClick,
}) => {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography variant="h6">Debug Logs</Typography>
      <TextField
        size="small"
        placeholder="Quick filter..."
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        sx={{ minWidth: 200 }}
      />
      <Button
        variant="outlined"
        startIcon={<FilterIcon />}
        onClick={onAdvancedFilterClick}
      >
        Advanced Filter
      </Button>
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={onRefreshClick}
      >
        Refresh
      </Button>
      <Button
        variant="outlined"
        startIcon={<ClearIcon />}
        onClick={onClearClick}
      >
        Clear
      </Button>
      <Button 
        variant="outlined" 
        onClick={onExportClick}
      >
        Export
      </Button>
    </Stack>
  );
};
