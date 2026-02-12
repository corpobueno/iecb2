import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import { Person as PersonIcon, AccessTime as TimeIcon } from '@mui/icons-material';

interface ComentarioItemProps {
  content: string;
  sender: string;
  timestamp: string;
  status: string;
  leadsType: string;
  statusColor?: string;
}

export const ComentarioItem: React.FC<ComentarioItemProps> = ({
  content,
  sender,
  timestamp,
  status,
  leadsType,
 
}) => {
  return (
    <Paper
      elevation={1}
      sx={{
        mb: 2,
        p: 2.5,
        borderRadius: 2,
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          borderColor: '#1976d2',
          transform: 'translateY(-2px)',
        }
      }}
    >
      {/* Header: Usuário e Timestamp */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1.5}
        pb={1}
        borderBottom="1px solid #f0f0f0"
      >
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon sx={{ fontSize: 18, color: '#666' }} />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: '#333',
              fontSize: '0.875rem'
            }}
          >
            {sender}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          <TimeIcon sx={{ fontSize: 14, color: '#999' }} />
          <Typography
            variant="caption"
            sx={{
              color: '#999',
              fontSize: '0.75rem'
            }}
          >
            {timestamp}
          </Typography>
        </Box>
      </Box>

      {/* Conteúdo do comentário */}
      <Typography
        variant="body2"
        sx={{
          mb: 1.5,
          color: '#444',
          lineHeight: 1.6,
          fontSize: '0.875rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {content}
      </Typography>

      {/* Tags: Status e Tipo de Lead */}
      <Box display="flex" gap={1} flexWrap="wrap">
        <Chip
          label={status}
          size="small"
          color="primary"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            height: 24
          }}
        />
        <Chip
          label={leadsType}
          size="small"
          variant="outlined"
          sx={{
            fontSize: '0.75rem',
            height: 24,
            borderColor: '#ddd',
            color: '#666'
          }}
        />
      </Box>
    </Paper>
  );
};
