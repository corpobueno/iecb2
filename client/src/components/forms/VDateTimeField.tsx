import { TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { getLocalDateTimeString } from '../../utils/functions';

// Tipos base
type BaseFieldProps = Omit<TextFieldProps, 'name'> & {
  name: string;
}

// Função helper para converter date para formato datetime-local (usando função centralizada)
const toLocalDateTimeString = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  return getLocalDateTimeString(date);
};

// Função helper para converter datetime-local para Date preservando o horário local
const fromLocalDateTimeString = (value: string): string => {
  if (!value) return '';

  // O valor já está no formato correto para envio (YYYY-MM-DDTHH:mm)
  // Apenas adicionamos segundos se necessário
  return value.includes(':') && value.split(':').length === 2 ? value + ':00' : value;
};

// VDateField - Campo de Data
export const VDateTimeField: React.FC<BaseFieldProps> = ({ name, ...rest }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
        <TextField
          {...rest}
          {...field}
          value={toLocalDateTimeString(value)}
          onChange={(e) => onChange(fromLocalDateTimeString(e.target.value))}
          id={name}
          type="datetime-local"
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


