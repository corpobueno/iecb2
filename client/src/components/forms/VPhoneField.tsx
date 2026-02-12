import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type TVPhoneFieldProps = Omit<TextFieldProps, 'name'> & {
  name: string;
}

export const VPhoneField: React.FC<TVPhoneFieldProps> = ({ name, ...rest }) => {
  const { control } = useFormContext();

  const formatPhoneNumber = (value: string) => {
    if (!value) return '';
    
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Verifica se é número brasileiro (começa com 55)
    if (numericValue.startsWith('55') && numericValue.length > 3) {
      const ddd = numericValue.substring(2, 4);

      if(numericValue.length === 4) {
        return `+55 ${ddd}`;
      }
      
      // Com 55 + DDD + 9 dígitos (celular)
      if (numericValue.length >= 13) {
        return `+55 (${ddd}) ${numericValue.substring(4, 5)} ${numericValue.substring(5, 9)}-${numericValue.substring(9, 13)}`;
      }
      
      // Com 55 + DDD + 8 dígitos (fixo)
      else if (numericValue.length >= 12) {
        return `+55 (${ddd}) ${numericValue.substring(4, 8)}-${numericValue.substring(8, 12)}`;
      }
      
      // Formatação parcial
      else if (numericValue.length > 4) {
        return `+55 (${ddd}) ${numericValue.substring(4)}`;
      }
      
      // Apenas 55 + DDD
      else if (numericValue.length > 1) {
        return `+55 (${numericValue.substring(2)})`;
      }
    }
    
    // Retorna sem formatação se não for número brasileiro ou estiver incompleto
    return numericValue;
  };

  const unformatPhoneNumber = (formattedValue: string) => {
    return formattedValue.replace(/\D/g, '');
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // Formatação para exibição
        const displayValue = formatPhoneNumber(field.value || '');
        
        return (
          <TextField
            {...rest}
            {...field}
            id={name}
            value={displayValue}
            error={!!error}
            helperText={error?.message}
            InputLabelProps={{
              shrink: !!field.value
            }}
            onChange={(e) => {
              const rawValue = unformatPhoneNumber(e.target.value);
              field.onChange(rawValue);
            }}
           
          />
        );
      }}
    />
  );
};