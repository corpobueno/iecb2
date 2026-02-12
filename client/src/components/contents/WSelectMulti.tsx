import React from 'react';
import { TextField, TextFieldProps, MenuItem, Box, Badge, Icon } from '@mui/material';

interface IOption {
  label: string;
  value: string | number;
}

/**
 * Props para seleção múltipla.
 * - `value` é um array de string/number
 * - `onChange` devolve um array de string/number
 */
type WSelectInputMultiProps = Omit<TextFieldProps, 'select' | 'onChange' | 'value'> & {
  options: IOption[];
  value?: string[] | number[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export const WSelectInputMulti: React.FC<WSelectInputMultiProps> = ({
  options,
  value,
  onChange,
  ...rest
}) => {
  // Lida com a mudança de valor no select
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Se multiple=true, o MUI envia um array em event.target.value
    onChange?.(event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
  };

  // Função auxiliar para buscar o label a partir do array de valores selecionados
  const getLabels = (selected: (string | number)[]) => {
    return selected.map((val) => {
      const found = options.find((opt) => opt.value === val);
      return found ? found.label : val;
    });
  };

  // renderValue é chamada pelo MUI para mostrar o “texto” (ou ReactNode) dos itens selecionados
  const renderSelectedValue = (selectedArray: unknown) => {
    // Garantimos que é um array de string|number
    const selectedValues = selectedArray as (string | number)[];
    const labels = getLabels(selectedValues);

    if (labels.length === 0) {
      // Nenhuma seleção
      return <em>Nenhuma</em>;
    }

    if (labels.length <= 2) {
      // Até 2 itens, mostramos normalmente
      return labels.join(', ');
    }

    // Mais de 2 itens selecionados:
    const [first, second] = labels;
    const remainingCount = '+'+(labels.length - 2);

    return (
      <Box display="inline-flex" alignItems="center" zIndex={100} gap={0.5}>
        {/* Exemplo: "option1, option2, ..." */}
        <span>{`${first}, ${second}`}</span>
        
        {/* Badge/Ícone mostrando quantidade de itens extras */}
        <Badge
  badgeContent={remainingCount}
  color="primary"
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  overlap="circular"
  sx={{

    '& .MuiBadge-badge': {
      fontSize: 10,
      top: '50%',        // Ajuste verticalmente; experimente diferentes valores
      right: '-12px',    // Ajuste horizontalmente se necessário
    },
  }}
>
  <Icon fontSize="small">more_horiz</Icon>
</Badge>

      </Box>
    );
  };

  return (
    <TextField
      {...rest}
      select
      value={value}
      onChange={handleChange}
      SelectProps={{
        multiple: true,
        renderValue: renderSelectedValue, // Customiza o texto mostrado quando há seleções
      }}
    >
      
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
};
