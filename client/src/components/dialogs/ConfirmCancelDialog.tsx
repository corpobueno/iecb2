import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { AlertTriangle } from 'lucide-react';

interface ConfirmCancelDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmDelay?: number; // em segundos
}

export const ConfirmCancelDialog: React.FC<ConfirmCancelDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = "Cancelar Transação",
  message = "Tem certeza que deseja cancelar esta transação?",
  confirmDelay = 4,
}) => {
  const [countdown, setCountdown] = useState(confirmDelay);
  const [canConfirm, setCanConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset quando o dialog abrir
      setCountdown(confirmDelay);
      setCanConfirm(false);

      // Iniciar contagem regressiva
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanConfirm(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [open, confirmDelay]);

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AlertTriangle color="#f44336" size={24} />
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>

        {!canConfirm ? (
          <Box
            mt={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
            sx={{
              p: 1.5,
              bgcolor: 'action.hover',
              borderRadius: 1,
            }}
          >
            <CircularProgress
              size={20}
              variant="determinate"
              value={(1 - countdown / confirmDelay) * 100}
            />
            <Typography variant="body2" color="text.secondary">
              Aguarde {countdown}s para confirmar
            </Typography>
          </Box>
        )
        :
        (<Box height={60}></Box>)
        }
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
        >
          Não
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={!canConfirm}
          sx={{
            minWidth: 80,
          }}
        >
          {canConfirm ? 'Sim' : `Sim (${countdown}s)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
