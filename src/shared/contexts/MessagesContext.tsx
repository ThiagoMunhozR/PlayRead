import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor, Dialog, DialogActions, DialogTitle, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useAppThemeContext } from '../contexts'

interface IMessageContextData {
  showAlert: (message: string, severity?: AlertColor) => void;
  showConfirmation: (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
}

const MessageContext = createContext({} as IMessageContextData);

export const useMessageContext = () => {
  return useContext(MessageContext);
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { themeName } = useAppThemeContext();
  const alertVariant = themeName === 'dark' ? 'outlined' : 'filled';
  
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));

  // State for the alert functionality
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>('info');

  // State for the confirmation dialog
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => () => { });
  const [onCancelAction, setOnCancelAction] = useState<() => void>(() => () => { });

  // Functions to show alert
  const showAlert = (message: string, severity: AlertColor = 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // Functions to handle alert close
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // Functions to show confirmation dialog
  const showConfirmation = (message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirmationMessage(message);
    setOnConfirmAction(() => () => {
      onConfirm();
      setConfirmationOpen(false);
    });
    setOnCancelAction(() => () => {
      if (onCancel) onCancel();
      setConfirmationOpen(false);
    });
    setConfirmationOpen(true);
  };

  // Functions to handle confirmation close
  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
  };

  return (
    <MessageContext.Provider value={{ showAlert, showConfirmation }}>
      {children}
      {/* Alert Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleAlertClose} variant={alertVariant} severity={alertSeverity}
        sx={{
          ...(themeName === 'dark' && {
            bgcolor: 'background.default',
          }),
          width: smDown ? '60%' : '100%', // Se a tela for pequena, a largura será 90%, caso contrário, será 100%
          maxWidth: '400px', // Limita a largura máxima
        }}>
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <DialogTitle id="confirmation-dialog-title" sx={{ paddingBottom: 2 }}>{confirmationMessage}</DialogTitle>
        <DialogActions>
          <Button onClick={onCancelAction} color="primary" variant='outlined'>
            <Typography variant='button' whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
              NÃO
            </Typography>
          </Button>
          <Button onClick={onConfirmAction} color="primary" variant="contained" autoFocus>
            <Typography variant='button' whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
              SIM
            </Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </MessageContext.Provider>
  );
};
