// src/forms/VCnpjField.tsx
import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { formatCNPJ, validateCNPJ } from '../../utils/documentValidator';

type TVCnpjFieldProps = Omit<TextFieldProps, 'name'> & {
  name: string;
  validateOnBlur?: boolean;
}

export const VCnpjField: React.FC<TVCnpjFieldProps> = ({ 
  name, 
  validateOnBlur = true,
  ...rest 
}) => {
  const { control, setError, clearErrors } = useFormContext();

  const handleBlur = async (value: string) => {
    if (!validateOnBlur || !value) return;
    
    const cleanedValue = value.replace(/\D/g, '');
    if (cleanedValue.length !== 14) {
      setError(name, { type: 'manual', message: 'CNPJ inválido' });
      return;
    }

    const isValid = await validateCNPJ(cleanedValue);
    if (!isValid) {
      setError(name, { type: 'manual', message: 'CNPJ inválido ou não encontrado' });
    } else {
      clearErrors(name);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const displayValue = formatCNPJ(field.value || '');
        
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
              const rawValue = e.target.value.replace(/\D/g, '');
              field.onChange(rawValue);
            }}
            onBlur={async (e) => {
              field.onBlur();
              await handleBlur(e.target.value);
            }}
          />
        );
      }}
    />
  );
};