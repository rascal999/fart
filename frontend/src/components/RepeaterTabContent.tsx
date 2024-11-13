import React from 'react';
import { Box, Grid } from '@mui/material';
import { RepeaterRequest } from './RepeaterRequest';
import { RepeaterResponse } from './RepeaterResponse';
import { Request, RequestConfig, RepeaterTab } from '../types/repeater';

interface RepeaterTabContentProps {
  tab: RepeaterTab;
  isLoading: boolean;
  onRequestChange: (field: keyof Request) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onConfigChange: (updates: Partial<RequestConfig>) => void;
  onSend: () => void;
  onClear: () => void;
}

const RepeaterTabContent: React.FC<RepeaterTabContentProps> = ({
  tab,
  isLoading,
  onRequestChange,
  onConfigChange,
  onSend,
  onClear,
}) => {
  return (
    <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
        <Grid item xs={12} md={6} sx={{ height: '100%' }}>
          <RepeaterRequest
            request={tab.request}
            config={tab.config}
            isLoading={isLoading}
            onRequestChange={onRequestChange}
            onConfigChange={onConfigChange}
            onSend={onSend}
            onClear={onClear}
          />
        </Grid>

        <Grid item xs={12} md={6} sx={{ height: '100%' }}>
          <RepeaterResponse
            response={tab.response}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RepeaterTabContent;
