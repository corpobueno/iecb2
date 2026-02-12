import { TextField, TextFieldProps } from '@mui/material';
import { useController, Control } from 'react-hook-form';

type TVSelectProps = TextFieldProps & {
  name: string;
  control: Control<any>; // Use Control com any para maior flexibilidade
};

export const VSelect: React.FC<TVSelectProps> = ({ name, control, children, ...rest }) => {
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error },
  } = useController({ name, control });

  return (
    <TextField
      {...rest}
      select
      id={name}
      error={!!error}
      helperText={error ? error.message : ''}
      value={value || 2}
      onChange={(e) => {
        onChange(e); // Atualiza o valor do campo no react-hook-form
        if (rest.onChange) rest.onChange(e); // Chama o onChange adicional se for passado no VSelect
      }}
      onBlur={onBlur}
      inputRef={ref}
    >
      {children}
    </TextField>
  );
};
