import React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface RepeaterNotificationsProps {
  error: string | null;
  success: string | null;
  onErrorClose: () => void;
  onSuccessClose: () => void;
}

const RepeaterNotifications: React.FC<RepeaterNotificationsProps> = ({
  error,
  success,
  onErrorClose,
  onSuccessClose,
}) => {
  return (
    <>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={onErrorClose}
      >
        <Alert severity="error" onClose={onErrorClose}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={onSuccessClose}
      >
        <Alert severity="success" onClose={onSuccessClose}>
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RepeaterNotifications;
