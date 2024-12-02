import React, { useState } from 'react';
import { Box, Paper, ButtonGroup, Button, Typography } from '@mui/material';
import { ViewColumn, ViewStream, Preview, Fullscreen, FullscreenExit } from '@mui/icons-material';
import { ProxyDetailsProps } from '../types/proxy';
import { formatRequest, formatResponse } from '../utils/httpFormatters';
import { ResizablePanel } from './ResizablePanel';

const TextDisplay = ({ label, content }: { label: string; content: string }) => (
  <Box
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid rgba(0, 0, 0, 0.23)',
      borderRadius: 1,
      overflow: 'hidden'
    }}
  >
    <Typography
      variant="body2"
      sx={{
        px: 1.5,
        py: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.23)'
      }}
    >
      {label}
    </Typography>
    <Box
      component="pre"
      sx={{
        flex: 1,
        m: 0,
        p: 1.5,
        overflow: 'auto',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        backgroundColor: '#fff'
      }}
    >
      {content}
    </Box>
  </Box>
);

const HtmlPreview = ({ content }: { content: string }) => (
  <Box
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid rgba(0, 0, 0, 0.23)',
      borderRadius: 1,
      overflow: 'hidden'
    }}
  >
    <Typography
      variant="body2"
      sx={{
        px: 1.5,
        py: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.23)'
      }}
    >
      HTML Preview
    </Typography>
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#fff'
      }}
    >
      <iframe
        srcDoc={content}
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        sandbox="allow-same-origin"
        title="HTML Preview"
      />
    </Box>
  </Box>
);

export const ProxyDetails: React.FC<ProxyDetailsProps> = ({ log }) => {
  const [isSideBySide, setIsSideBySide] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);

  if (!log) return null;

  // Case-insensitive check for Content-Type header
  const getContentType = () => {
    if (!log.response?.headers) return null;
    
    // Find content-type header (case-insensitive)
    const contentTypeKey = Object.keys(log.response.headers)
      .find(key => key.toLowerCase() === 'content-type');
    
    if (!contentTypeKey) return null;
    return log.response.headers[contentTypeKey];
  };

  const isHtmlResponse = (() => {
    const contentType = getContentType();
    if (!contentType) return false;
    
    // Check for HTML content type
    return contentType.toLowerCase().includes('html');
  })();

  const requestField = (
    <TextDisplay
      key="request"
      label="HTTP Request"
      content={formatRequest(log)}
    />
  );

  const responseField = isRendering && isHtmlResponse && log.response?.content ? (
    <HtmlPreview
      key="response"
      content={log.response.content}
    />
  ) : (
    <TextDisplay
      key="response"
      label="HTTP Response"
      content={formatResponse(log)}
    />
  );

  return (
    <Box 
      mt={3}
      sx={isFullScreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1300,
        backgroundColor: 'background.paper',
        p: 3,
        display: 'flex',
        flexDirection: 'column'
      } : {}}
    >
      <Box mb={2} display="flex" justifyContent="flex-end">
        <ButtonGroup>
          <Button
            variant={isFullScreen ? "contained" : "outlined"}
            onClick={() => setIsFullScreen(!isFullScreen)}
            startIcon={isFullScreen ? <FullscreenExit /> : <Fullscreen />}
          >
            {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          </Button>
          <Button
            variant={isSideBySide ? "outlined" : "contained"}
            onClick={() => setIsSideBySide(false)}
            startIcon={<ViewStream />}
          >
            Top/Bottom
          </Button>
          <Button
            variant={isSideBySide ? "contained" : "outlined"}
            onClick={() => setIsSideBySide(true)}
            startIcon={<ViewColumn />}
          >
            Side by Side
          </Button>
          {isHtmlResponse && log.response?.content && (
            <Button
              variant={isRendering ? "contained" : "outlined"}
              onClick={() => setIsRendering(!isRendering)}
              startIcon={<Preview />}
            >
              Render
            </Button>
          )}
        </ButtonGroup>
      </Box>
      
      <Paper sx={{ p: 1, flex: isFullScreen ? 1 : 'unset' }}>
        <ResizablePanel
          isSideBySide={isSideBySide}
          splitPosition={splitPosition}
          onSplitChange={setSplitPosition}
        >
          {[requestField, responseField]}
        </ResizablePanel>
      </Paper>
    </Box>
  );
};
