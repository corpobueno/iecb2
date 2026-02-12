import { TextField, TextFieldProps } from '@mui/material';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import { Controller, useFormContext } from 'react-hook-form';

type TVTextFieldProps = Omit<NumericFormatProps, 'value'> & Omit<TextFieldProps, 'value'> & {
  name: string;
  isParcelas?: boolean;
  onValueChange?: (value: string) => void;
}

/**
 * - Para resgatar o valor numérico no correto use o `onValueChange`
 * - Para eventos normais use o `onChange`
 *
 * Para como customizar a formatação verifique a documentação original do `react-number-format` [nesse link](https://www.npmjs.com/package/react-number-format) ou [nesse link](https://s-yadav.github.io/react-number-format/docs/intro/)
 */
export const VNumericFormat: React.FC<TVTextFieldProps> = ({ name, isParcelas, onValueChange, ...rest }) => {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        // Verifica se isParcelas é true e o valor é igual a 1
        const displayValue = isParcelas && field.value === 1 ? 'À vista' : field.value || '';

        return (
          <NumericFormat
            {...rest as any}
            customInput={TextField}
            value={field.value || ''}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            onValueChange={({ value }) => {
              setValue(name, value);
              onValueChange?.(value);
            }}
            InputProps={{
              // Customiza o valor visual exibido no campo
              inputProps: {
                value: displayValue, // Exibe "À vista" visualmente
                readOnly: isParcelas && field.value === '1', // Torna o campo readonly quando exibe "À vista"
              },
            }}
          />
        );
      }}
    />
  );
};


