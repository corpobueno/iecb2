import React, { useState, useEffect, ChangeEvent } from 'react';
import { TextField, InputAdornment, TextFieldProps } from '@mui/material';

type WCashProps = Omit<TextFieldProps, 'onChange' | 'value'> & {
  value: number | string;
  name: string;
  label?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  max?: number;
  disabled?: boolean;
  size?: 'small' | 'medium';
  error?: boolean;
  helperText?: string;
}

export const WCash: React.FC<WCashProps> = (props) => {
  const {
    size = 'medium',
    disabled = false,
    value,
    name,
    label = 'Valor',
    onChange,
    max,
    error: externalError,
    helperText: externalHelperText,
    ...rest
  } = props;
  const [input, setInput] = useState<string>('');

  // Sincroniza o valor externo para o formato de exibição
  useEffect(() => {
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    const valueInCents = Math.round(numericValue * 100);
    setInput(valueInCents.toString());
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Permite apenas dígitos
    let txt = e.target.value.replace(/[^0-9]/g, '');
    
    setInput(txt);

    // Converte para valor decimal (divide por 100)
    const numericValue = txt ? parseInt(txt, 10) / 100 : 0;
    
    // Propaga para o pai com o valor em reais (com ponto decimal)
    const ev = {
      ...e,
      target: {
        ...e.target,
        name,
        value: numericValue.toString(),
      },
    } as ChangeEvent<HTMLInputElement>;
    onChange(ev);
  };

  // Converte o valor atual para exibição formatada
  const displayValue = input
    ? (parseInt(input, 10) / 100).toFixed(2).replace('.', ',')
    : '0,00';

  const numericValue = input ? parseInt(input, 10) / 100 : 0;
  const maxError = max !== undefined && numericValue > max;

  // Prioriza erro externo, senão verifica erro de máximo
  const hasError = externalError !== undefined ? externalError : maxError;
  const errorMessage = externalHelperText || (maxError ? `Máximo: ${max}` : undefined);

  return (
    <TextField
      {...rest}
      disabled={disabled}
      fullWidth
      name={name}
      size={size}
      label={label}
      value={displayValue}
      onChange={handleChange}
      error={hasError}
      helperText={errorMessage}
      InputProps={{
        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
        inputMode: 'decimal',
      }}
      inputProps={{
        pattern: '^[0-9]*$',
      }}
    />
  );
};