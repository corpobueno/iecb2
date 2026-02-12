import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type TVTextFieldProps = Omit<TextFieldProps, 'name'> & {
  name: string;
  min?: string;
  max?: string;
}

export const VTime: React.FC<TVTextFieldProps> = ({ name, min, max, ...rest }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
   
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...rest}
          {...field}
          id={name}
          type="time"
          error={!!error}
          helperText={error?.message}
          InputLabelProps={{
            shrink: true, // Força a label a "flutuar" no topo quando há valor
        }}
        />
      )}
    />
  );
};
