import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type TVSelectProps = Omit<TextFieldProps, 'name'> & {
  name: string;
};

export const VSelect: React.FC<TVSelectProps> = ({ name, children, InputLabelProps, ...rest }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...rest}
          {...field}
          select
          id={name}
          error={!!error}
          helperText={error?.message}
          value={field.value ?? ''}
          InputLabelProps={{
            shrink: !!field.value || field.value === 0 || InputLabelProps?.shrink,
            ...InputLabelProps,
          }}
        >
          {children}
        </TextField>
      )}
    />
  );
};
