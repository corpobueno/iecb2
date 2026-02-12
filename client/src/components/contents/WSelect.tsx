import React from 'react';
import { TextField, TextFieldProps, MenuItem } from '@mui/material';

/** Estrutura de cada opção do select */
interface IOption {
  label: string;
  value: string | number;
}

/**
 * Props para seleção simples.
 * - `value` é um string/number
 * - `onChange` devolve um string/number
 */
type WSelectInputSingleProps = Omit<TextFieldProps, 'select' | 'onChange' | 'value'> & {
  options: IOption[];
  value?: string | number;
  onChange?: (newValue: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export const WSelectInputSingle: React.FC<WSelectInputSingleProps> = ({
  options,
  value,
  onChange,
  ...rest
}) => {
  // Lida com mudança de valor no select
 const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Se multiple=true, o MUI envia um array em event.target.value
    onChange?.(event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
  };

  return (
    <TextField
      {...rest}
      select
      value={value ?? ''} // Se undefined, usa string vazia
      onChange={handleChange}
    >
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
};
