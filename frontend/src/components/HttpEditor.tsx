import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface HttpEditorProps extends Omit<TextFieldProps, 'value'> {
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const HttpEditor: React.FC<HttpEditorProps> = ({ value, onChange, ...props }) => {
  return (
    <TextField
      {...props}
      value={value}
      onChange={onChange}
      multiline
      fullWidth
      variant="outlined"
      InputProps={{
        ...props.InputProps,
        style: {
          fontFamily: '"Consolas", "Monaco", "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          backgroundColor: '#1e1e1e',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: '#d4d4d4',
          height: '100%',
          alignItems: 'flex-start',
          overflow: 'auto',
        },
      }}
      inputProps={{
        style: {
          height: '100%',
          alignItems: 'flex-start',
          overflow: 'auto',
        },
        spellCheck: false,
      }}
      sx={{
        width: '100%',
        height: '100%',
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#1e1e1e',
          height: '100%',
          alignItems: 'flex-start',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.23)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#90caf9',
          },
        },
        '& .MuiOutlinedInput-input': {
          height: '100% !important',
          alignItems: 'flex-start !important',
          overflow: 'auto !important',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(255, 255, 255, 0.23)',
        },
        '& .MuiInputLabel-root': {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-focused': {
            color: '#90caf9',
          },
        },
        ...props.sx,
      }}
    />
  );
};

export default HttpEditor;
