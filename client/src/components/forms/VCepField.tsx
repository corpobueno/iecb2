import React, { useState } from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type TVCepFieldProps = Omit<TextFieldProps, 'name'> & {
  name: string;
}

interface CepResponseData {
  bairro: string;
  localidade: string;
  uf: string;
  logradouro: string;
  complemento: string;
  ibge: string;
  erro?: boolean;
}

export const VCepField: React.FC<TVCepFieldProps> = ({ name, ...rest }) => {
  const { control, setValue, setError, clearErrors } = useFormContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleCepBlur = async (cep: string) => {
    if (!cep || cep.length !== 8) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: CepResponseData = await response.json();
      
      if (data.erro) {
        setError('cep', { type: 'manual', message: 'CEP não encontrado' });
        return;
      }
      
      clearErrors('cep');

      // Preenche endereço (logradouro) se disponível
      if (data.logradouro) {
        setValue('address', data.logradouro);
      }

      setValue('bairro', data.bairro);
      setValue('city', data.localidade);
      setValue('state', data.uf.toLowerCase());

      // Preenche código IBGE do município para NFe
      if (data.ibge) {
        setValue('cityCode', data.ibge);
      }

      // Define país padrão
      setValue('countryCode', '1058'); // Brasil
      setValue('countryName', 'Brasil');

      // Simula pressionar Enter para ir para o próximo campo
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true
      });
      
      if (document.activeElement) {
        document.activeElement.dispatchEvent(event);
      }
    } catch (error) {
      setError('cep', { type: 'manual', message: 'Erro ao buscar CEP' });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para remover a formatação do CEP (manter apenas números)
  const unformatCep = (value: string) => {
    return value.replace(/\D/g, '');
  };

  // Função para formatar o CEP com traço (74440-000)
  const formatCepDisplay = (value: string) => {
    const numericValue = unformatCep(value);
    
    if (numericValue.length <= 5) {
      return numericValue;
    }
    
    return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
  };

  // Handler para tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Encontrar o formulário e o próximo campo
      const formElement = e.currentTarget.closest('form');
      if (!formElement) return;
      
      // Obtém todos os campos de entrada do formulário
      const inputs = formElement.querySelectorAll('input, select, textarea');
      const inputsArray = Array.from(inputs);
      
      // Encontra o campo atual
      let currentInput = null;
      for (const input of inputs) {
        if (input === document.activeElement) {
          currentInput = input;
          break;
        }
      }
      
      if (currentInput) {
        // Encontra o índice do campo atual
        const currentIndex = inputsArray.indexOf(currentInput);
        
        // Move para o próximo campo se existir
        if (currentIndex > -1 && currentIndex < inputsArray.length - 1) {
          const nextInput = inputsArray[currentIndex + 1] as HTMLElement;
          nextInput.focus();
        }
      }
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // Valor formatado para exibição
        const displayValue = formatCepDisplay(field.value || '');
        
        return (
          <TextField
            {...rest}
            {...field}
            id={name}
            value={displayValue}
            disabled={isLoading || rest.disabled}
            error={!!error}
            helperText={error?.message}
            InputLabelProps={{
              shrink: !!field.value
            }}
            onChange={(e) => {
              // Extrai apenas os números do input
              const numericValue = unformatCep(e.target.value);
              
              // Armazena apenas os números (limitado a 8 dígitos)
              const formattedValue = numericValue.slice(0, 8);
              field.onChange(formattedValue);
              
              // Auto-submit when 8 digits are entered
              if (formattedValue.length === 8) {
                handleCepBlur(formattedValue);
              }
            }}
            onBlur={(e) => {
              field.onBlur();
              const numericValue = unformatCep(e.target.value);
              if (numericValue.length === 8) {
                handleCepBlur(numericValue);
              }
            }}
            onKeyDown={handleKeyDown}
            inputProps={{
              maxLength: 9, // 5 dígitos + traço + 3 dígitos = 9 caracteres
            }}
            placeholder="00000-000"
          />
        );
      }}
    />
  );
};