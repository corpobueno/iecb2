// SnackbarContext.tsx
import { Snackbar, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Badge, Menu, MenuItem, Typography, Box } from '@mui/material';
import React, { createContext, useContext, useState, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';

interface SnackbarAction {
  label: string;
  onClick: () => void;
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  variant?: 'text' | 'outlined' | 'contained';
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: Date;
  action?: SnackbarAction;
}

interface SnackbarContextType {
  showSnackbarMessage: (
    message: string,
    type?: 'success' | 'warning' | 'error' | 'info',
    action?: SnackbarAction
  ) => void;
  clearNotifications: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSnackbar, setActiveSnackbar] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
    action?: SnackbarAction;
  } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const notificationIdCounter = useRef(0);

  const showSnackbarMessage = (
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'success',
    action?: SnackbarAction
  ) => {
    // Verifica se já existe uma notificação idêntica recente (últimos 5 segundos)
    const now = new Date();
    const recentThreshold = 5000; // 5 segundos em milissegundos

    const isDuplicate = notifications.some(notification =>
      notification.message === message &&
      notification.type === type &&
      (now.getTime() - notification.timestamp.getTime()) < recentThreshold
    );

    if (isDuplicate) {
      return; // Não adiciona notificação duplicada
    }

    const newNotification: Notification = {
      id: `notification-${notificationIdCounter.current++}`,
      message,
      type,
      timestamp: now,
      action
    };

    // Armazena todas as notificações exceto as de sucesso (se desejar)
    if (type !== 'success') {
      setNotifications(prev => [newNotification, ...prev]); // Adiciona no início
    }

    // Exibe a notificação conforme o tipo
    if (type === 'success') {
      setActiveSnackbar({ message, type, action });
      setTimeout(() => setActiveSnackbar(null), 3000);
    } else if (type === 'info') {
      setActiveSnackbar({ message, type, action });
      setTimeout(() => setActiveSnackbar(null), 5000); // Info dura 5 segundos
    } else if (type === 'warning') {
      setActiveSnackbar({ message, type, action });
      setOpenDialog(true);
    } else if (type === 'error') {
      setActiveSnackbar({ message, type, action });
      setOpenDialog(true);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setAnchorEl(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbarMessage, clearNotifications }}>
      {children}

      {/* Botão de notificação flutuante */}
      {notifications.length > 0 && (
        <Box sx={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
          <IconButton
            color="inherit"
            onClick={handleNotificationClick}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': { backgroundColor: 'primary.dark' },
              boxShadow: 3
            }}
          >
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Box>
      )}

      {/* Menu de notificações */}
      <Menu
        anchorEl={anchorEl}
        anchorPosition={{ top: 90, left: 90 }}
        open={Boolean(anchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          style: {
            maxHeight: '400px',
            width: '350px',
          },
        }}
      >
        <MenuItem>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Typography >Notificações</Typography >
            <Button size="small" onClick={clearNotifications}>Limpar tudo</Button>
          </Box>
        </MenuItem>

        {notifications.length === 0 ? (
          <MenuItem disabled>Nenhuma notificação</MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem key={notification.id} divider sx={{ py: 2 }}>
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                      color: notification.type === 'error' ? 'error.main' :
                        notification.type === 'warning' ? 'warning.main' :
                          notification.type === 'info' ? 'info.main' : 'success.main'
                    }}
                  >
                    {notification.type}
                  </Typography>
                  <IconButton size="small" onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    mb: 1
                  }}
                >
                  {notification.message}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem'
                  }}
                >
                  {notification.timestamp.toLocaleTimeString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Snackbar para success */}
      {activeSnackbar && activeSnackbar.type === 'success' && (
        <Snackbar
          open={true}
          autoHideDuration={3000}
          onClose={() => setActiveSnackbar(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setActiveSnackbar(null)}
            severity={activeSnackbar.type}
            sx={{ width: '100%' }}
          >
            <Typography fontWeight={500}>
              {activeSnackbar.message}
            </Typography>

          </Alert>
        </Snackbar>
      )}

      {/* Snackbar para info */}
      {activeSnackbar && activeSnackbar.type === 'info' && (
        <Snackbar
          open={true}
          autoHideDuration={5000}
          onClose={() => setActiveSnackbar(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setActiveSnackbar(null)}
            severity="info"
            sx={{ width: '100%' }}
          >
            {activeSnackbar.message}
          </Alert>
        </Snackbar>
      )}

      {/* Dialog para erros */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="error-dialog-title"
      >
        <DialogTitle id="error-dialog-title" sx={{
          backgroundColor: activeSnackbar?.type + '.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{activeSnackbar?.type}</span>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: '20px', minWidth: '400px' }}>
          <Typography sx={{ fontSize: '1.1rem', margin: '16px 0' }}>
            {activeSnackbar?.message}
          </Typography>
        </DialogContent>
        <DialogActions>
          {activeSnackbar?.action && (
            <Button
              onClick={() => {
                activeSnackbar.action?.onClick();
                handleCloseDialog();
              }}
              variant={activeSnackbar.action.variant || 'outlined'}
              color={activeSnackbar.action.color || 'primary'}
              sx={{ margin: '0 0 16px 16px' }}
            >
              {activeSnackbar.action.label}
            </Button>
          )}
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            color="primary"
            sx={{ margin: '0 16px 16px 0' }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};