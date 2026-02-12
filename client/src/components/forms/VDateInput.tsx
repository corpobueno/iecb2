import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type TVTextFieldProps = Omit<TextFieldProps, 'name'> & {
  name: string;
};

export const VDateInput: React.FC<TVTextFieldProps> = ({ name, ...rest }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...rest}
          id={name}
          type="date"
          error={!!error}
          helperText={error?.message}
          InputLabelProps={{
            shrink: true, // Manter o label encolhido ao preencher a data
          }}
        />
      )}
    />
  );
};
