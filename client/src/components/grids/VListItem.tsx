import { Paper, Stack, Box, Typography, Chip, IconButton, Icon, SxProps, Theme } from '@mui/material';
import { ReactNode, isValidElement } from 'react';

interface VListItemProps {
  children: ReactNode;
  isEditing?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

/**
 * Item de lista vertical (card)
 * Componente base para exibir itens em uma lista vertical
 */
export const VListItem = ({ children, isEditing = false, onClick, sx }: VListItemProps) => {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 1,
        transition: 'all 0.2s',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main',
        },
        borderLeft: isEditing ? '3px solid' : '1px solid',
        borderLeftColor: isEditing ? 'primary.main' : 'divider',
        ...sx,
      }}
    >
      <Stack spacing={0.75}>{children}</Stack>
    </Paper>
  );
};

interface VListItemHeaderProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
}

/**
 * Cabeçalho do item da lista
 */
export const VListItemHeader = ({ title, subtitle, badge, actions }: VListItemHeaderProps) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ flex: 1 }}>
        {typeof title === 'string' ? (
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        ) : (
          title
        )}
        {subtitle && (
          typeof subtitle === 'string' ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          ) : (
            subtitle
          )
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {badge}
        {actions}
      </Box>
    </Box>
  );
};

interface VListItemBadgeProps {
  label: string;
  icon?: ReactNode;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  variant?: 'filled' | 'outlined';
}

/**
 * Badge/Chip para o cabeçalho do item
 */
export const VListItemBadge = ({ label, icon, color = 'default', variant = 'outlined' }: VListItemBadgeProps) => {
  return <Chip icon={icon && isValidElement(icon) ? icon : undefined} label={label} size="small" color={color} variant={variant} />;
};

interface VListItemContentProps {
  columns?: 1 | 2 | 3 | 4;
  children: ReactNode;
  gap?: number;
}

/**
 * Conteúdo do item em grid
 */
export const VListItemContent = ({ columns = 2, children, gap = 1 }: VListItemContentProps) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {children}
    </Box>
  );
};

interface VListItemFieldProps {
  label: string;
  value: string | number | ReactNode;
  fullWidth?: boolean;
}

/**
 * Campo individual do item
 */
export const VListItemField = ({ label, value, fullWidth = false }: VListItemFieldProps) => {
  return (
    <Box sx={{ gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
        {label}
      </Typography>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  );
};

interface VListItemFooterProps {
  left?: ReactNode;
  right?: ReactNode;
  center?: ReactNode;
}

/**
 * Rodapé do item (geralmente total e ações)
 */
export const VListItemFooter = ({ left, right, center }: VListItemFooterProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 0.25,
      }}
    >
      <Box>{left}</Box>
      {center && <Box>{center}</Box>}
      <Box>{right}</Box>
    </Box>
  );
};

interface VListItemTotalProps {
  label?: string;
  value: string | number;
  variant?: 'body1' | 'body2' | 'h6' | 'h5';
}

/**
 * Componente para exibir total no rodapé
 */
export const VListItemTotal = ({ label = 'Total', value, variant = 'h6' }: VListItemTotalProps) => {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant={variant} color="primary" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
};

interface VListItemActionsProps {
  children: ReactNode;
}

/**
 * Container para botões de ação
 */
export const VListItemActions = ({ children }: VListItemActionsProps) => {
  return <Box sx={{ display: 'flex', gap: 0.5 }}>{children}</Box>;
};

interface VListItemActionButtonProps {
  icon: string;
  onClick: () => void;
  title?: string;
  color?: 'default' | 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Botão de ação individual
 */
export const VListItemActionButton = ({
  icon,
  onClick,
  title,
  color = 'default',
  disabled = false,
  size = 'small',
}: VListItemActionButtonProps) => {
  return (
    <IconButton onClick={onClick} title={title} color={color} size={size} disabled={disabled}>
      <Icon>{icon}</Icon>
    </IconButton>
  );
};
