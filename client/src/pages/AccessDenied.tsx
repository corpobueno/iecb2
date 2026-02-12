import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Block, Visibility, VisibilityOff, VpnKey } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface AccessDeniedProps {
  message?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ message }) => {
  const { loginWithAdminPassword, error } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    const success = await loginWithAdminPassword(password);
    setIsLoading(false);

    if (success) {
      // Recarrega a página para aplicar a autenticação
      window.location.reload();
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '90%',
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <Block sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Acesso Negado
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {message || 'Você não tem permissão para acessar este sistema.'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Por favor, acesse através do sistema principal.
        </Typography>

        {/* Botão para mostrar formulário de senha */}
        <Button
          variant="text"
          size="small"
          startIcon={<VpnKey />}
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          sx={{ mt: 3 }}
        >
          Acesso administrativo
        </Button>

        {/* Formulário de senha de administrador */}
        <Collapse in={showPasswordForm}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              fullWidth
              size="small"
              label="Senha de administrador"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              error={!!error}
              helperText={error}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !password.trim()}
              startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
            >
              {isLoading ? 'Autenticando...' : 'Entrar'}
            </Button>
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
};
