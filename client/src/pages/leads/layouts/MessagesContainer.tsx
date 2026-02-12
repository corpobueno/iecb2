import React from 'react';
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';
import { Message as MessageEmptyIcon, Refresh } from '@mui/icons-material';

interface MessagesContainerProps {
  isLoading: boolean;
  isRefreshing?: boolean; // Novo prop para indicar refresh
  children: React.ReactNode;
  emptyMessage?: string;
  showEmpty?: boolean;
  height?: string;
}

export const MessagesContainer: React.FC<MessagesContainerProps> = ({
  isLoading,
  isRefreshing = false,
  children,
  emptyMessage = "Nenhuma mensagem encontrada",
  showEmpty = false,
  height = '85vh'
}) => {
  // Loading inicial - tela completa de loading
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
        height={height}
      >
        <Box textAlign="center">
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Carregando mensagens...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: `calc(${height} - 45px)`,
      borderRadius: '8px 8px 8px 0 ',
      m: 1,
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Indicador de refresh no topo */}
      {isRefreshing && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(2px)',
          borderRadius: '8px 8px 0 0',
          py: 1,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Refresh 
            sx={{ 
              fontSize: 16, 
              color: 'primary.main',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': {
                  transform: 'rotate(0deg)',
                },
                '100%': {
                  transform: 'rotate(360deg)',
                },
              },
            }} 
          />
          <Typography variant="caption" color="primary.main">
            Atualizando mensagens...
          </Typography>
          <LinearProgress 
           
            sx={{ 
              flexGrow: 1, 
              ml: 1,
              height: 2,
              borderRadius: 1
            }} 
          />
        </Box>
      )}

      <Box sx={{
        flexGrow: 1,
        overflowY: 'auto',
        backgroundImage: 'url(/bgwpp.png)',
        backgroundSize: 'auto',
        backgroundPosition: 'start',
        overflowX: 'hidden',
        p: 2,
        paddingTop: isRefreshing ? 5 : 2, // Mais espaço quando está refreshing
        transition: 'padding-top 0.3s ease',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#c1c1c1',
          borderRadius: '10px',
          '&:hover': {
            background: '#a8a8a8',
          },
        },
      }}>
        {showEmpty ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="200px"
            sx={{ color: 'text.secondary' }}
          >
            <MessageEmptyIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              {emptyMessage}
            </Typography>
            <Typography variant="body2">
              Inicie uma conversa enviando uma mensagem
            </Typography>
          </Box>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
};