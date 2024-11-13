import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
} from '@mui/material';
import { FilterOptions } from '../types/logs';

interface LogFilterProps {
  open: boolean;
  filterOptions: FilterOptions;
  onClose: () => void;
  onFilterChange: (options: FilterOptions) => void;
}

export const LogFilter: React.FC<LogFilterProps> = ({
  open,
  filterOptions,
  onClose,
  onFilterChange,
}) => {
  const handleClear = () => {
    onFilterChange({
      method: '',
      url: '',
      status: '',
      type: '',
      source: ''
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Advanced Filter</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Method"
            value={filterOptions.method}
            onChange={(e) => onFilterChange({ ...filterOptions, method: e.target.value })}
            placeholder="GET, POST, etc."
          />
          <TextField
            label="URL"
            value={filterOptions.url}
            onChange={(e) => onFilterChange({ ...filterOptions, url: e.target.value })}
            placeholder="Filter by URL..."
          />
          <TextField
            label="Status"
            value={filterOptions.status}
            onChange={(e) => onFilterChange({ ...filterOptions, status: e.target.value })}
            placeholder="200, 404, etc."
          />
          <TextField
            label="Type"
            value={filterOptions.type}
            onChange={(e) => onFilterChange({ ...filterOptions, type: e.target.value })}
            placeholder="info, error, request, etc."
          />
          <TextField
            label="Source"
            value={filterOptions.source}
            onChange={(e) => onFilterChange({ ...filterOptions, source: e.target.value })}
            placeholder="Proxy, Repeater, etc."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear}>Clear</Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
