// src/forms/VCpfField.tsx
import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { formatCPF, validateCPF } from '../../utils/documentValidator';

type TVCpfFieldProps = Omit<TextFieldProps, 'name'> & {
  name: string;
  validateOnBlur?: boolean;
}

export const VCpfField: React.FC<TVCpfFieldProps> = ({ 
  name, 
  validateOnBlur = true,
  ...rest 
}) => {
  const { control, setError, clearErrors } = useFormContext();

  const handleBlur = async (value: string) => {
    if (!validateOnBlur || !value) return;
    
    const cleanedValue = value.replace(/\D/g, '');
    if (cleanedValue.length !== 11) {
      setError(name, { type: 'manual', message: 'CPF inválido' });
      return;
    }

    const isValid = await validateCPF(cleanedValue);
    if (!isValid) {
      setError(name, { type: 'manual', message: 'CPF inválido ou não encontrado' });
    } else {
      clearErrors(name);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const displayValue = formatCPF(field.value || '');
        
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