import React from 'react';
import { Box, CircularProgress, Typography, } from '@mui/material';
import { CommentOutlined as CommentIcon } from '@mui/icons-material';

interface ComentariosContainerProps {
  isLoading: boolean;
  children: React.ReactNode;
  emptyMessage?: string;
  showEmpty?: boolean;
  height?: string;
}

export const ComentariosContainer: React.FC<ComentariosContainerProps> = ({
  isLoading,
  children,
  emptyMessage = "Nenhum comentário encontrado",
  showEmpty = false,
  height = '85vh'
}) => {
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
            Carregando comentários...
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
      borderRadius: 2,
      m: 1,
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          pb: 1.5,
          backgroundColor: '#f8f9fa',
          borderBottom: '2px solid #e0e0e0'
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <CommentIcon sx={{ fontSize: 20, color: '#666' }} />
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: '#333' }}>
        Histórico de Comentários
          </Typography>
        </Box>
      </Box>

      {/* Conteúdo scrollável */}
      <Box sx={{
        flexGrow: 1,
        overflowY: 'auto',
        backgroundColor: '#fafafa',
        p: 2,
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
            <CommentIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3, color: '#ccc' }} />
            <Typography variant="h6" sx={{ mb: 1, color: '#999' }}>
              {emptyMessage}
            </Typography>
            
          </Box>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
};
