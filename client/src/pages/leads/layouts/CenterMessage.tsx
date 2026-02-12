import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { styled, keyframes, css } from '@mui/material/styles';

// Animação de fade in para mensagens do sistema
const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const AnimatedBox = styled(Box)<{ isNew?: boolean }>`
  ${({ isNew }) =>
    isNew &&
    css`
      animation: ${fadeInScale} 0.5s ease-out;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        animation: ${shimmer} 1.5s ease-in-out;
      }
    `}
`;

interface CenterMessageProps {
  content: string;
  timestamp?: string;
  showChip?: boolean;
  chipLabel?: string;
  chipColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  isNew?: boolean; // Nova prop para indicar se é uma mensagem nova

}

export const CenterMessage: React.FC<CenterMessageProps> = ({
  content,
  timestamp,
  showChip = false,
  chipLabel = "Sistema",
  chipColor = "info",
  isNew = false,

}) => {
  return (
    <AnimatedBox
      isNew={isNew}
      sx={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        my: 2,
        px: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{
        maxWidth: '80%',
        textAlign: 'center',
        bgcolor: '#f5f5f5',
        borderRadius: 2,
        p: 2,
        border: '1px solid #e0e0e0',
        animation: isNew ? css`${fadeInScale} 0.5s ease-out 0.1s both` : 'none',
      }}>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: showChip || timestamp ? 1 : 0,
            color: 'text.secondary',
            fontStyle: 'italic',
            fontSize: '0.8rem'
          }}
        >
          {content}
        </Typography>
        
        {(showChip || timestamp) && (
          <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
            {showChip && (
              <Chip
                label={chipLabel}
                size="small"
                color={chipColor}
                sx={{ 
                  fontSize: '0.7rem',
                  animation: isNew ? css`${fadeInScale} 0.7s ease-out 0.2s both` : 'none',
                }}
              />
            )}
            {timestamp && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{
                  animation: isNew ? css`${fadeInScale} 0.5s ease-out 0.3s both` : 'none',
                  fontSize: '0.65rem'
                }}
              >
                {timestamp}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </AnimatedBox>
  );
};