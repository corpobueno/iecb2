import { FormControlLabel, Switch, SwitchProps } from '@mui/material';
import { useController, useFormContext } from 'react-hook-form';

type TVSwitchProps = SwitchProps & {
  name: string;
  label: string;
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
};

export const VSwitch: React.FC<TVSwitchProps> = ({ name, ...rest }) => {
  const { control } = useFormContext();
  
  const {
    field: { onChange, onBlur, value, ref },
    fieldState: {}
  } = useController({
    name,
    control,
    defaultValue: false, // Valor padrão para o switch (false = desativado)
  });

  return (
    <FormControlLabel 
    label={rest.label}
    labelPlacement={rest.labelPlacement || 'end'}
    control ={
    <Switch
      {...rest}
      inputRef={ref}
      checked={!!value} // O valor precisa ser um booleano
      onChange={(e, checked) => {
        onChange(checked); // Atualiza o estado no React Hook Form
        rest.onChange?.(e, checked); // Chama qualquer função de onChange passada como prop
      }}
      onBlur={onBlur} // Garante que o blur do campo seja registrado
    />
    }
    
    />
  );
};
