import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import HttpEditor from './HttpEditor';
import { RepeaterResponseProps } from '../types/repeater';
import { formatHttpResponse } from '../utils/repeaterUtils';

export const RepeaterResponse: React.FC<RepeaterResponseProps> = ({
  response,
  isLoading
}) => {
  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box p={3} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Response
        </Typography>
        
        {response ? (
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <HttpEditor
              label="HTTP Response"
              value={formatHttpResponse(response)}
              InputProps={{ readOnly: true }}
            />
          </Box>
        ) : (
          <Typography color="textSecondary">
            {isLoading ? 'Sending request...' : 'No response yet. Send a request to see the response here.'}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
