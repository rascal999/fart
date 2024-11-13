import React from 'react';
import { Box, Button } from '@mui/material';
import { 
  Send as SendIcon, 
  Clear as ClearIcon, 
  CallMerge as RedirectIcon 
} from '@mui/icons-material';
import { RequestConfig } from '../../types/repeater';

interface RepeaterRequestActionsProps {
  isLoading: boolean;
  config: RequestConfig;
  onConfigChange: (updates: Partial<RequestConfig>) => void;
  onSend: () => void;
  onClear: () => void;
}

export const RepeaterRequestActions: React.FC<RepeaterRequestActionsProps> = ({
  isLoading,
  config,
  onConfigChange,
  onSend,
  onClear,
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        variant="contained"
        startIcon={<SendIcon />}
        onClick={onSend}
        disabled={isLoading || !config.host.trim()}
      >
        {isLoading ? 'Sending...' : 'Send Request'}
      </Button>
      <Button
        variant="outlined"
        startIcon={<ClearIcon />}
        onClick={onClear}
        disabled={isLoading}
      >
        Clear
      </Button>
      <Button
        variant={config.followRedirects ? "contained" : "outlined"}
        startIcon={<RedirectIcon />}
        onClick={() => onConfigChange({ followRedirects: !config.followRedirects })}
        disabled={isLoading}
        color={config.followRedirects ? "primary" : "inherit"}
        sx={{ ml: 'auto' }}
      >
        {config.followRedirects ? 'Following Redirects' : 'Follow Redirects'}
      </Button>
    </Box>
  );
};
