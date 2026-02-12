import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

/** 
 * Interface que estende todas as props padrão de TextField. 
 * Assim, podemos usar variant, label, name etc. 
 */
type IWDateInputProps = TextFieldProps & {
  // Caso precise, adicione outras props customizadas aqui
}

export const WDateInput: React.FC<IWDateInputProps> = (props) => {
  const {
    value = '',     // Valor inicial (vazio por padrão)
    onChange,       // Função de callback quando o valor mudar
    ...rest         // Demais props repassadas ao TextField
  } = props;

  // Função de validação para garantir o formato yyyy-mm-dd
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const pattern = /^\d{4}-\d{2}-\d{2}$/; // Regex para yyyy-mm-dd

    if (pattern.test(newValue)) {
      // Se for válido, chamamos o onChange original (se definido).
      onChange?.(event);
    } else {
      // Caso contrário, você pode escolher:
      // - Não fazer nada
      // - Mostrar algum aviso/erro
      // - Reverter para o valor anterior
      console.warn('Formato de data inválido. Esperado yyyy-mm-dd.');
    }
  };

  return (
    <TextField
      {...rest}                          // Repassa todas as props (label, name, variant etc.)
      type="date"
      value={value}
      onChange={handleDateChange}
      InputLabelProps={{ shrink: true }} // Garante que o label não sobreponha o placeholder do tipo="date"
    />
  );
};
