import React from 'react';
import { 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow 
} from '@mui/material';
import { ProxyDetailsProps } from '../types/proxy';

export const ProxyDetails: React.FC<ProxyDetailsProps> = ({ log }) => {
  if (!log) return null;

  return (
    <Box mt={3}>
      <Paper sx={{ mb: 2, p: 2 }}>
        <h3>Request Details</h3>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Header</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {log.request_headers && Object.entries(log.request_headers).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{String(value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {log.request_content && (
          <Box mt={2}>
            <h4>Request Body</h4>
            <pre style={{ overflowX: 'auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {log.request_content}
            </pre>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <h3>Response Details</h3>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Header</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {log.response_headers && Object.entries(log.response_headers).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{String(value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {log.response_content && (
          <Box mt={2}>
            <h4>Response Body</h4>
            <pre style={{ overflowX: 'auto', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {log.response_content}
            </pre>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
