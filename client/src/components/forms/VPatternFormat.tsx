import { TextField, TextFieldProps } from '@mui/material';
import { PatternFormat, PatternFormatProps } from 'react-number-format';
import { Controller, useFormContext } from 'react-hook-form';

type TVTextFieldProps = Omit<PatternFormatProps, 'value'> & Omit<TextFieldProps, 'value'> & {
  name: string;
  onValueChange?: (value: string) => void;
}

/**
 * - Para resgatar o valor numérico no correto use o `onValueChange`
 * - Para eventos normais use o `onChange`
 *
 * Para como customizar a formatação verifique a documentação original do `react-number-format`.
 */
export const VPatternFormat: React.FC<TVTextFieldProps> = ({ name, onValueChange, ...rest }) => {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field, fieldState }) => (
        <PatternFormat
          {...rest as any}
          customInput={TextField}
          value={field.value || ''}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          onValueChange={({ value }) => {
            setValue(name, value);
            onValueChange?.(value);
          }}
        />
      )}
    />
  );
};
