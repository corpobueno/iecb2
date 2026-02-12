import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      padding={3}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 500,
          width: '100%',
          textAlign: 'center'
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 100,
            color: 'error.main',
            mb: 2
          }}
        />

        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          404
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom>
          Página não encontrada
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
          A página que você está procurando não existe ou foi movida.
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 3 }}
        >
          Voltar para o início
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;
