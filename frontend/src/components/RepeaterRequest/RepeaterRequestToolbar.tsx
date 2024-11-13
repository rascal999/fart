import React from 'react';
import { Box, TextField, Select, MenuItem } from '@mui/material';
import { RequestConfig } from '../../types/repeater';

interface RepeaterRequestToolbarProps {
  config: RequestConfig;
  onConfigChange: (updates: Partial<RequestConfig>) => void;
}

export const RepeaterRequestToolbar: React.FC<RepeaterRequestToolbarProps> = ({
  config,
  onConfigChange,
}) => {
  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or numbers only
    if (value === '' || /^\d+$/.test(value)) {
      onConfigChange({ port: value });
    }
  };

  const handleHostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ host: e.target.value });
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Select
        value={config.protocol}
        onChange={(e) => onConfigChange({ protocol: e.target.value as 'http' | 'https' })}
        sx={{ width: '120px' }}
      >
        <MenuItem value="http">HTTP</MenuItem>
        <MenuItem value="https">HTTPS</MenuItem>
      </Select>

      <TextField
        label="Port"
        value={config.port}
        onChange={handlePortChange}
        sx={{ width: '100px' }}
        error={!config.port}
        helperText={!config.port ? 'Required' : ''}
      />
      
      <TextField
        label="Host"
        value={config.host}
        onChange={handleHostChange}
        fullWidth
        required
        error={!config.host.trim()}
        helperText={!config.host.trim() ? 'Host is required' : ''}
        placeholder="example.com"
      />
    </Box>
  );
}
