import { Button, ButtonProps, Typography } from '@mui/material';
import { lighten, darken } from '@mui/material/styles';

interface WButtonProps extends Omit<ButtonProps, 'color'> {
  /**
   * Cor customizada em formato hexadecimal (#ffffff) ou cor do tema MUI
   */
  color?: string;
  /**
   * Define se deve usar a cor como background (contained) ou borda/texto (outlined/text)
   */
  variant?: 'contained' | 'outlined' | 'text';
  /**
   * Texto do botão
   */
  children: React.ReactNode;
}

/**
 * Verifica se a cor é hexadecimal
 */
const isHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

/**
 * Calcula a luminância da cor para determinar se o texto deve ser branco ou preto
 * Para modo contained, sempre retorna branco para melhor contraste
 */
const getContrastColor = (hexColor: string, variant: string): string => {
  // No modo contained, sempre usar branco para melhor contraste
  if (variant === 'contained') {
    return '#FFFFFF';
  }

  // Para outlined e text, usar a própria cor
  return hexColor;
};

export const WButton = ({
  color,
  variant = 'contained',
  children,
  sx,
  disabled,
  ...rest
}: WButtonProps) => {
  // Se não houver cor ou for uma cor do tema MUI, usar comportamento padrão
  if (!color || !isHexColor(color)) {
    return (
      <Button
        variant={variant}
        color={color as any || 'primary'}
        disabled={disabled}
        sx={sx}
        disableElevation
        {...rest}
      >
        <Typography
          variant="button"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          overflow="hidden"
        >
          {children}
        </Typography>
      </Button>
    );
  }

  // Cor hexadecimal customizada
  const hexColor = color;
  const textColor = getContrastColor(hexColor, variant);
  const hoverBgColor = variant === 'contained' ? darken(hexColor, 0.1) : lighten(hexColor, 0.9);
  const activeBgColor = variant === 'contained' ? darken(hexColor, 0.2) : lighten(hexColor, 0.8);

  // Estilos baseados na variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'contained':
        return {
          bgcolor: hexColor,
          color: textColor,
          border: 'none',
          '&:hover': {
            bgcolor: hoverBgColor,
          },
          '&:active': {
            bgcolor: activeBgColor,
          },
        };

      case 'outlined':
        return {
          bgcolor: 'transparent',
          color: hexColor,
          border: `1px solid ${hexColor+'dd'}`,
          '&:hover': {
            bgcolor: hoverBgColor,
            border: `1px solid ${hexColor+'dd'}`,
          },
          '&:active': {
            bgcolor: activeBgColor+'dd',
          },
        };

      case 'text':
        return {
          bgcolor: 'transparent',
          color: hexColor,
          border: 'none',
          '&:hover': {
            bgcolor: hoverBgColor,
          },
          '&:active': {
            bgcolor: activeBgColor,
          },
        };

      default:
        return {};
    }
  };

  return (
    <Button
      variant={variant}
      disabled={disabled}
      disableElevation
      sx={{
        ...getVariantStyles(),
        '&.Mui-disabled': {
          bgcolor: variant === 'contained' ? 'action.disabledBackground' : 'transparent',
          color: 'action.disabled',
          borderColor: variant === 'outlined' ? 'action.disabled' : undefined,
        },
        ...sx,
      }}
      {...rest}
    >
      <Typography
        variant="button"
        whiteSpace="nowrap"
        textOverflow="ellipsis"
        overflow="hidden"
      >
        {children}
      </Typography>
    </Button>
  );
};
