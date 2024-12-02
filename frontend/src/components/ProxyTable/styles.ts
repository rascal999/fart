import { TableCell, styled } from '@mui/material';

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  position: 'relative',
  padding: '6px 16px',
  userSelect: 'none',
  fontFamily: '"Roboto Mono", "Courier New", monospace',
  
  // Column header styles
  '& .header-content': {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    
    '& .drag-handle': {
      cursor: 'grab',
      opacity: 0.5,
      transition: 'opacity 0.2s ease',
      
      '&:hover': {
        opacity: 1,
      },
      
      '&.dragging': {
        opacity: 1,
        cursor: 'grabbing',
      }
    },
    
    '&.priority': {
      fontWeight: 600,
    }
  },
  
  // Resizer styles
  '& .resizer': {
    position: 'absolute',
    right: -3,
    top: 0,
    height: '100%',
    width: '6px',
    background: 'transparent',
    cursor: 'col-resize',
    userSelect: 'none',
    touchAction: 'none',
    zIndex: 1,
    transition: 'background-color 0.2s ease',
    
    '&.isResizing': {
      background: theme.palette.primary.main,
      opacity: 0.5,
      width: '8px',
    },
    
    '&:hover': {
      background: theme.palette.primary.main,
      opacity: 0.3,
      width: '8px',
    }
  },
  
  // Drag and drop styles
  '&.dragging': {
    opacity: 0.5,
    background: theme.palette.action.hover,
  },

  '&.drop-target': {
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      width: '3px',
      background: theme.palette.primary.main,
      opacity: 0.7,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: 0,
      height: '100%',
      width: '3px',
      background: theme.palette.primary.main,
      opacity: 0.7,
    },
    background: `${theme.palette.action.hover} !important`,
  },
  
  // Cell content styles
  '& .cell-content': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    
    '&.truncated': {
      cursor: 'help',
    }
  },
  
  // Column visibility menu button
  '& .column-menu-button': {
    padding: 4,
    minWidth: 'unset',
    
    '&:hover': {
      background: theme.palette.action.hover,
    }
  }
}));

export const StyledColumnMenu = styled('div')(({ theme }) => ({
  '& .MuiMenuItem-root': {
    minHeight: 'unset',
    padding: '4px 16px',
    
    '&.priority': {
      fontWeight: 600,
    }
  },
  
  '& .MuiCheckbox-root': {
    padding: '4px',
    marginRight: '8px',
  }
}));

export const HttpMethodChip = styled('span')<{ method: string }>(({ theme, method }) => {
  const methodColors = {
    GET: '#4CAF50',
    POST: '#2196F3',
    PUT: '#FF9800',
    DELETE: '#F44336',
    PATCH: '#9C27B0',
    HEAD: '#607D8B',
    OPTIONS: '#795548',
  };

  const color = methodColors[method as keyof typeof methodColors] || '#9E9E9E';

  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: color,
    color: '#fff',
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.5',
    letterSpacing: '0.02em',
    textTransform: 'uppercase'
  };
});
