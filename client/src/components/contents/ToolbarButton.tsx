import { Button, Typography } from '@mui/material';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface ToolbarButtonProps {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  variant?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
  startIcon?: ReactNode;
}

/**
 * Botão padronizado para uso no SaveToolbar
 * Mantém o mesmo estilo visual dos botões nativos
 */
export const ToolbarButton = ({
  label,
  icon: Icon,
  onClick,
  color = 'primary',
  variant = 'outlined',
  disabled = false,
  startIcon,
}: ToolbarButtonProps) => {
  return (
    <Button
      color={color}
      disableElevation
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      startIcon={startIcon || (Icon && <Icon size={17} />)}
    >
      <Typography variant="button" whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
        {label}
      </Typography>
    </Button>
  );
};
