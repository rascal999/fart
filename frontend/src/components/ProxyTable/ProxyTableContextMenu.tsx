import React, { useState } from 'react';
import { Menu, MenuItem, Divider } from '@mui/material';
import { ArrowRight as ArrowRightIcon } from '@mui/icons-material';
import { ProxyLog } from '../../types/proxy';
import { 
  generateCurlCommand,
  generateNmapCommand,
  generateGobusterCommand,
  generateDirbCommand,
  generateNiktoCommand,
  generateSqlmapCommand
} from '../../utils/proxyUtils';

interface ProxyTableContextMenuProps {
  contextMenu: { mouseX: number; mouseY: number; log: ProxyLog } | null;
  onClose: () => void;
  onSendToRepeater: (log: ProxyLog) => void;
  onDelete: (log: ProxyLog) => void;
}

export const ProxyTableContextMenu: React.FC<ProxyTableContextMenuProps> = ({
  contextMenu,
  onClose,
  onSendToRepeater,
  onDelete,
}) => {
  const [copyAsMenuAnchor, setCopyAsMenuAnchor] = useState<null | HTMLElement>(null);

  const closeAllMenus = () => {
    setCopyAsMenuAnchor(null);
    onClose();
  };

  const handleCopyUrl = () => {
    if (contextMenu?.log) {
      navigator.clipboard.writeText(contextMenu.log.url);
      closeAllMenus();
    }
  };

  const handleOpenUrl = () => {
    if (contextMenu?.log) {
      window.open(contextMenu.log.url, '_blank');
      closeAllMenus();
    }
  };

  const handleCopyDomain = () => {
    if (contextMenu?.log) {
      const url = new URL(contextMenu.log.url);
      navigator.clipboard.writeText(url.hostname);
      closeAllMenus();
    }
  };

  const handleCopyAsCurl = () => {
    if (contextMenu?.log) {
      navigator.clipboard.writeText(generateCurlCommand(contextMenu.log));
      closeAllMenus();
    }
  };

  const handleCopyAsNmap = () => {
    if (contextMenu?.log) {
      navigator.clipboard.writeText(generateNmapCommand(contextMenu.log));
      closeAllMenus();
    }
  };

  const handleCopyAsGobuster = () => {
    if (contextMenu?.log) {
      navigator.clipboard.writeText(generateGobusterCommand(contextMenu.log));
      closeAllMenus();
    }
  };

  const handleCopyAsDirb = () => {
    if (contextMenu?.log) {
      navigator.clipboard.writeText(generateDirbCommand(contextMenu.log));
      closeAllMenus();
    }
  };

  const handleCopyAsNikto = () => {
    if (contextMenu?.log) {
      navigator.clipboard.writeText(generateNiktoCommand(contextMenu.log));
      closeAllMenus();
    }
  };

  const handleCopyAsSqlmap = () => {
    if (contextMenu?.log) {
      navigator.clipboard.writeText(generateSqlmapCommand(contextMenu.log));
      closeAllMenus();
    }
  };

  const handleSendToRepeater = () => {
    if (contextMenu?.log) {
      onSendToRepeater(contextMenu.log);
      closeAllMenus();
    }
  };

  const handleDelete = () => {
    if (contextMenu?.log) {
      onDelete(contextMenu.log);
      closeAllMenus();
    }
  };

  const handleCopyAsClick = (event: React.MouseEvent<HTMLElement>) => {
    setCopyAsMenuAnchor(event.currentTarget);
  };

  return (
    <>
      <Menu
        open={contextMenu !== null}
        onClose={closeAllMenus}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleCopyUrl}>Copy URL</MenuItem>
        <MenuItem onClick={handleOpenUrl}>Open URL</MenuItem>
        <MenuItem onClick={handleCopyDomain}>Copy Domain</MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleCopyAsClick}
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Copy as <ArrowRightIcon />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSendToRepeater}>Send to repeater</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>

      <Menu
        anchorEl={copyAsMenuAnchor}
        open={Boolean(copyAsMenuAnchor)}
        onClose={() => setCopyAsMenuAnchor(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleCopyAsCurl}>curl</MenuItem>
        <MenuItem onClick={handleCopyAsNmap}>nmap</MenuItem>
        <MenuItem onClick={handleCopyAsGobuster}>gobuster</MenuItem>
        <MenuItem onClick={handleCopyAsDirb}>dirb</MenuItem>
        <MenuItem onClick={handleCopyAsNikto}>nikto</MenuItem>
        <MenuItem onClick={handleCopyAsSqlmap}>sqlmap</MenuItem>
      </Menu>
    </>
  );
};
