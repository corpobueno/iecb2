import { TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

// Tipos base
type BaseFieldProps = Omit<TextFieldProps, 'name'> & {
  name: string;
}

// VDateField - Campo de Data
export const VDateField: React.FC<BaseFieldProps> = ({ name, ...rest }) => {
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
          type="date"
          error={!!error}
          helperText={error?.message}
          InputLabelProps={{
            shrink: true
          }}
        />
      )}
    />
  );
};

