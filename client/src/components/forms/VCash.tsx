import { InputAdornment, TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { useCallback } from 'react';

type TVTextFieldProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
  name: string;
  small?: boolean;
  onValueChange?: (value: string) => void;
}

/**
 * Componente para entrada de valores monetários onde os dígitos são interpretados como centavos
 * - Digitando 556 = R$ 5,56 (valor armazenado: "5.56")
 * - Para resgatar o valor numérico correto use o `onValueChange`
 */
export const VCash: React.FC<TVTextFieldProps> = ({ small = false, name, onValueChange, ...rest }) => {
  const { control, setValue } = useFormContext();

  const formatValueToDisplay = useCallback((value: string): string => {
    if (!value || value === "0" || value === "0.00") return "";
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "";
    
    return numValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);

  const handleInputChange = useCallback((inputValue: string, _: string) => {
    // Remove tudo que não for dígito
    const digitsOnly = inputValue.replace(/\D/g, '');
    
    if (!digitsOnly) {
      setValue(name, "");
      onValueChange?.("");
      return "";
    }
    
    // Converte os dígitos para valor decimal (centavos para reais)
    const centValue = (parseInt(digitsOnly) / 100).toFixed(2);
    setValue(name, centValue);
    onValueChange?.(centValue);
    
    // Retorna valor formatado para exibição
    return formatValueToDisplay(centValue);
  }, [name, setValue, onValueChange, formatValueToDisplay]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        return (
          <TextField
            {...rest}
            size={small ? 'small' : 'medium'}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              },
            }}
            value={formatValueToDisplay(field.value)}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            onChange={(e) => {
              handleInputChange(e.target.value, field.value);
              // Não precisamos atualizar o field.value aqui pois o setValue já faz isso
            }}
            onBlur={() => {
              // Reformata o valor quando perde o foco
              if (field.value) {
                formatValueToDisplay(field.value);
                // Força uma re-renderização para garantir formatação correta
                field.onChange(field.value);
              }
            }}
          />
        );
      }}
    />
  );
};