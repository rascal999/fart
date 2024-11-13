import { TableCell, styled } from '@mui/material';

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  position: 'relative',
  padding: '6px 16px',
  userSelect: 'none',
  fontFamily: '"Roboto Mono", "Courier New", monospace',
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
  }
}));
