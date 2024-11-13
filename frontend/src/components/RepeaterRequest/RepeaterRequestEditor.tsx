import React from 'react';
import { Box } from '@mui/material';
import HttpEditor from '../HttpEditor';
import { Request } from '../../types/repeater';

interface RepeaterRequestEditorProps {
  request: Request;
  onRequestChange: (field: keyof Request) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const RepeaterRequestEditor: React.FC<RepeaterRequestEditorProps> = ({
  request,
  onRequestChange,
}) => {
  return (
    <Box sx={{ flex: 1, minHeight: 0, mb: 2 }}>
      <HttpEditor
        label="HTTP Request"
        value={request.headers}
        onChange={onRequestChange('headers')}
        placeholder={`GET / HTTP/1.1
Host: example.com
User-Agent: FART-Proxy
Accept: */*`}
      />
    </Box>
  );
};
