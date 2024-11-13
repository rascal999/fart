import React from 'react';
import { 
  Menu, 
  MenuItem, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';

interface RepeaterTabMenuProps {
  anchorEl: HTMLElement | null;
  importDialogOpen: boolean;
  importData: string;
  onClose: () => void;
  onSort: () => void;
  onExport: () => void;
  onImportClick: () => void;
  onImportDialogClose: () => void;
  onImportDataChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onImport: () => void;
  onCloseAll: () => void;
}

const RepeaterTabMenu: React.FC<RepeaterTabMenuProps> = ({
  anchorEl,
  importDialogOpen,
  importData,
  onClose,
  onSort,
  onExport,
  onImportClick,
  onImportDialogClose,
  onImportDataChange,
  onImport,
  onCloseAll,
}) => {
  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
      >
        <MenuItem onClick={onSort}>
          <SortIcon sx={{ mr: 1 }} /> Sort Tabs
        </MenuItem>
        <MenuItem onClick={onExport}>
          <FileDownloadIcon sx={{ mr: 1 }} /> Export Tabs
        </MenuItem>
        <MenuItem onClick={onImportClick}>
          <FileUploadIcon sx={{ mr: 1 }} /> Import Tabs
        </MenuItem>
        <MenuItem onClick={onCloseAll}>
          <CloseIcon sx={{ mr: 1 }} /> Close All Tabs
        </MenuItem>
      </Menu>

      <Dialog open={importDialogOpen} onClose={onImportDialogClose}>
        <DialogTitle>Import Tabs</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={4}
            fullWidth
            value={importData}
            onChange={onImportDataChange}
            placeholder="Paste JSON data here..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onImportDialogClose}>Cancel</Button>
          <Button onClick={onImport} variant="contained">Import</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RepeaterTabMenu;
