import {
  Box,
  TextField,
  Button,
  Paper,
  IconButton,
  Tooltip,
  LinearProgress,
  MenuItem,
  Popover,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';

interface SelectOption {
  id: string | number;
  label: string;
}

interface MessageInputProps {
  messageText: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  selectValue?: string | number;
  selectOptions?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  showAttachment?: boolean;
  onAttachmentClick?: () => void;
  multiline?: boolean;
  maxRows?: number;
  isSending?: boolean;
  tentativas?: number;
}

export const ComentariosInput: React.FC<MessageInputProps> = ({
  messageText,
  handleChange,
  onSend,
  selectValue,
  selectOptions = [],
  placeholder = "Digite sua mensagem...",
  disabled = false,
  showAttachment = false,
  onAttachmentClick,
  multiline = true,
  maxRows = 4,
  isSending = false,
  tentativas = 0
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [progress, setProgress] = useState(0);
  const [isProgressActive, setIsProgressActive] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const disabledStatus = (value: any) => {

    switch (true) {
      case ['1 mes', '2 meses'].includes(value):
        return true;
      case value === 'Sem Contato' && tentativas < 4:
        return true;
      default:
        return false;
    }
  }

  // Popover handlers
  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  // Handler para mudança de status
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  };

  const handleSendWithValidation = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    if (selectValue) {
      onSend();
    } else {
      handlePopoverOpen(e as React.MouseEvent<HTMLButtonElement>);
    }
  };

  const popoverOpen = Boolean(anchorEl);
  const popoverId = popoverOpen ? 'status-popover' : undefined;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (isSending) {
      setIsProgressActive(true);
      setProgress(0);

      const interval = 100;
      const totalTime = 10000;
      const increment = (interval / totalTime) * 100;

      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + increment;
        });
      }, interval);
    } else {
      if (isProgressActive) {
        setProgress(100);
        setTimeout(() => {
          setIsProgressActive(false);
          setProgress(0);
        }, 300);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSending, isProgressActive]);

  const canSend = messageText.trim() && !isSending;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e0e0e0',
        position: 'sticky',
        bottom: 0,
        zIndex: 1
      }}
    >
      <Box
        component="form"
        display="flex"
        gap={2}
        alignItems="flex-end"
        onSubmit={handleSendWithValidation}
        position="relative"
      >
        {isProgressActive && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 2,
                borderRadius: 1,
              }}
            />
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                position: 'absolute',
                top: '40%',
                left: 0,
                right: 0,
                height: 10,
                zIndex: 3,
                '& .MuiLinearProgress-bar': {
                  transition: 'transform 0.1s linear',
                }
              }}
            />
          </>
        )}

        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, flex: 1 }}>
          {showAttachment && (
            <Tooltip title="Anexar arquivo">
              <IconButton
                onClick={onAttachmentClick}
                disabled={disabled || isSending}
                sx={{
                  color: '#666',
                  '&:hover': { color: '#1976d2' }
                }}
              >
                <AttachFileIcon />
              </IconButton>
            </Tooltip>
          )}

          {!isSmallScreen && (
            <TextField
              select
              name='status'
              label="Status"
              value={selectValue}
              onChange={handleStatusChange}
              size="small"
              sx={{ minWidth: 150 }}
            >
              {selectOptions.map((option: any) => (
                <MenuItem key={option.id} value={option.id} disabled={disabledStatus(option.id)}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            name='texto'
            fullWidth
            size="small"
            sx={{
              bgcolor: "#fff",
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                },
              }
            }}
            placeholder={placeholder}
            multiline={multiline}
            maxRows={maxRows}
            value={messageText}
            onChange={handleChange}
            disabled={disabled || isSending}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !multiline) {
                e.preventDefault();
                if (canSend) handleSendWithValidation(e);
              }
            }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!canSend || disabled || isSending}
          sx={{
            minWidth: 56,
            height: 40,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
            },
            '&.Mui-disabled': {
              boxShadow: 'none',
            }
          }}
        >
          <SendIcon />
        </Button>

        {/* Popover para seleção de status em telas pequenas ou quando não preenchido */}
        <Popover
          id={popoverId}
          open={popoverOpen}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <Box sx={{ p: 2, minWidth: 200 }}>
            <TextField
              select
              fullWidth
              name='status'
              label="Selecione o status"
              value={selectValue}
              onChange={(e) => {
                const event = e as React.ChangeEvent<HTMLInputElement>;
                handleStatusChange(event);
                handlePopoverClose();
                onSend();
              }}
              size="small"
            >
              {selectOptions.map((option) => (
                <MenuItem key={option.id} value={option.id} disabled={disabledStatus(option.id)}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Popover>
      </Box>
    </Paper>
  );
};