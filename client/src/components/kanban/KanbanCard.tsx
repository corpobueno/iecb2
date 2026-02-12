import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { Icon, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface CardTextIconProps {
  children: React.ReactNode;
  iconName?: string;
  iconColor?: string;
  fontWeight?: number;
  toCopy?: ReactNode;
}

export const CardTextIcon: React.FC<CardTextIconProps> = ({
  children,
  iconName,
  iconColor,
  fontWeight,
  toCopy
}) => {
  return (
    <Box display={'flex'} alignItems={'center'}>
      {iconName && (
        <Icon sx={{ mr: 0.7, color: iconColor || '#2e6aec' }} fontSize={'inherit'}>
          {iconName}
        </Icon>
      )}
      <Typography
        color='#444'
        fontSize={'0.85rem'}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        variant="subtitle1"
        fontWeight={fontWeight}
      >
        {children}
      </Typography>
      {toCopy}
    </Box>
  );
};

interface KanbanCardContainerProps {
  children: ReactNode;
  onClick?: () => void;
  sx?: any;
}

export const KanbanCardContainer: React.FC<KanbanCardContainerProps> = ({
  children,
  onClick,
  sx
}) => {
  return (
    <Box sx={sx} data-kanban-card>
      <Card
        sx={{
          position: 'relative',
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? {
            boxShadow: 3,
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out'
          } : {}
        }}
        variant="outlined"
        onClick={onClick}
      >
        {children}
      </Card>
    </Box>
  );
};

interface KanbanCardContentProps {
  children: ReactNode;
  gap?: number;
  padding?: number;
}

export const KanbanCardContent: React.FC<KanbanCardContentProps> = ({
  children,
  gap = 0.5,
  padding = 1
}) => {
  return (
    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap, p: padding }}>
      {children}
    </CardContent>
  );
};

interface KanbanCardActionsProps {
  children: ReactNode;
  position?: 'absolute' | 'relative';
}

export const KanbanCardActions: React.FC<KanbanCardActionsProps> = ({
  children,
  position = 'absolute'
}) => {
  return (
    <CardActions sx={{
      position,
      display: 'flex',
      justifyContent: 'flex-end',
      bottom: 0,
      right: 5,
      p: 0
    }}>
      {children}
    </CardActions>
  );
};

interface KanbanCardBadgeProps {
  children: ReactNode;
  title?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  bgcolor?: string;
}

export const KanbanCardBadge: React.FC<KanbanCardBadgeProps> = ({
  children,
  title,
  position = 'top-right',
  bgcolor = '#fff'
}) => {
  const positionStyles = {
    'top-right': { top: 0, right: 0 },
    'top-left': { top: 0, left: 0 },
    'bottom-right': { bottom: 0, right: 0 },
    'bottom-left': { bottom: 0, left: 0 },
  };

  return (
    <Box
      title={title}
      sx={{
        p: 1,
        bgcolor,
        position: 'absolute',
        ...positionStyles[position],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.8
      }}
    >
      {children}
    </Box>
  );
};
