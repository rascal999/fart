import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { Request, RequestConfig } from '../../types/repeater';
import { constructUrl, parseHttpRequest } from '../../utils/repeaterUtils';

interface ContextMenu {
  mouseX: number;
  mouseY: number;
}

interface RepeaterRequestContextMenuProps {
  contextMenu: ContextMenu | null;
  request: Request;
  config: RequestConfig;
  onClose: () => void;
}

export const RepeaterRequestContextMenu: React.FC<RepeaterRequestContextMenuProps> = ({
  contextMenu,
  request,
  config,
  onClose,
}) => {
  const handleCopyUrl = () => {
    const { requestLine } = parseHttpRequest(request.headers);
    const url = constructUrl(config, requestLine.path);
    navigator.clipboard.writeText(url);
    onClose();
  };

  const handleCopyAsCurl = () => {
    const { requestLine, headers } = parseHttpRequest(request.headers);
    const url = constructUrl(config, requestLine.path);
    let curl = `curl -X ${requestLine.method} '${url}'`;
    
    // Add headers
    headers.split('\n').forEach(header => {
      if (header.trim()) {
        curl += ` -H '${header.trim()}'`;
      }
    });
    
    // Add request body if exists
    if (request.body) {
      curl += ` -d '${request.body}'`;
    }

    navigator.clipboard.writeText(curl);
    onClose();
  };

  return (
    <Menu
      open={contextMenu !== null}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      <MenuItem onClick={handleCopyUrl}>Copy URL</MenuItem>
      <MenuItem onClick={handleCopyAsCurl}>Copy as curl</MenuItem>
    </Menu>
  );
};
