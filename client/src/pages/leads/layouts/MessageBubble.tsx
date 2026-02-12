import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { styled, keyframes, css } from '@mui/material/styles';

// Animação de slide in para mensagens novas
const slideInFromBottom = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  50% {
    box-shadow: 0 4px 20px rgba(25, 118, 210, 0.3);
  }
`;

const AnimatedBox = styled(Box)<{ isNew?: boolean; isFromUser?: boolean }>`
  ${({ isNew }) =>
    isNew &&
    css`
      animation: ${slideInFromBottom} 0.6s ease-out, ${pulseGlow} 2s ease-in-out;
    `}
`;

interface MessageBubbleProps {
  content: string;
  sender?: string;
  timestamp: string;
  isFromUser: boolean;
  chips?: Array<{
    label: string;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    size?: 'small' | 'medium';
  }>;
  maxWidth?: string;
  isNew?: boolean; // Nova prop para indicar se é uma mensagem nova
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  sender,
  timestamp,
  isFromUser,
  chips = [],
  maxWidth = '70%',
  isNew = false
}) => {
  const backgroundColor = isFromUser ? '#dcf8c6' : '#ffffff';
  const borderColor = isFromUser ? '#c8e6c9' : '#f5f5f5';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isFromUser ? 'flex-end' : 'flex-start',
        mb: 2,
        px: 1
      }}
    >
      <AnimatedBox
        isNew={isNew}
        isFromUser={isFromUser}
        sx={{
          maxWidth,
          bgcolor: backgroundColor,
          border: `1px solid ${borderColor}`,
          position: 'relative',
          borderRadius: 2,
          p: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'scale(1.02)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 0,
            height: 0,
            border: '8px solid transparent',
            borderRightColor: backgroundColor,
            borderLeft: 0,
            left: '-8px',
            top: '12px',
            display: isFromUser ? 'none' : 'block'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 0,
            height: 0,
            border: '8px solid transparent',
            borderLeftColor: backgroundColor,
            borderRight: 0,
            right: '-8px',
            top: '12px',
            display: isFromUser ? 'block' : 'none'
          }
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            mb: chips.length > 0 ? 1 : 0.5,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.3,
            fontSize: '0.85rem'
          }}
        >
          {content}
        </Typography>
        
        {chips.length > 0 && (
          <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
            {chips.map((chip, index) => (
              <Chip
                key={index}
                label={chip.label}
                size={chip.size || 'small'}
                color={chip.color || 'default'}
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        )}
        
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          gap={2}
          mt={0.5}
        >
          {sender && (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
              {sender}
            </Typography>
          )}
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              ml: 'auto',
              fontSize: '0.65rem',
              opacity: 0.7
            }}
          >
            {timestamp}
          </Typography>
        </Box>
      </AnimatedBox>
    </Box>
  );
};