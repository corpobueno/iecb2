// src/components/forms/VProductField.tsx
import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, TextFieldProps, CircularProgress } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { UserService } from '../../api/services/UserService';
import { IUser } from '../../entities/User';


type TVRepresentativeFieldProps = Omit<TextFieldProps, 'name'> & {
  name: string;
  isExternalLoading?: boolean;
}

export const VRepresentativeField: React.FC<TVRepresentativeFieldProps> = ({ 
  name, 
  isExternalLoading = false,
  ...rest 
}) => {
  const { control, setValue } = useFormContext();
  const [representatives, setRepresentatives] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] = useState<IUser | null>(null);

  // Carrega a lista de produtos quando o componente é montado
  useEffect(() => {
    loadRepresentatives();
  }, []);

  // Carrega o produto selecionado quando o valor muda
  useEffect(() => {
    const subscription = control._formValues[name];
    if (subscription && typeof subscription === 'string' && subscription.length > 0) {
      loadRepresentativeById(subscription);
    }
    
    return () => {};
  }, [control._formValues[name]]);

  const loadRepresentatives = async () => {
    setLoading(true);
    try {
      const response = await UserService.find({});
      if (!(response instanceof Error)) {
        setRepresentatives(response.data);
      } else {
        console.error("Erro ao carregar produtos:", response.message);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRepresentativeById = async (username: string) => {
    if (!username) return;
    
    try {
      const response = await UserService.getByUsername(username);
      if (!(response instanceof Error)) {
        setSelectedRepresentative(response);
      }
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      setSelectedRepresentative(null);
    }
  };

  // Função para lidar com a navegação do Enter
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
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          options={representatives}
          loading={loading || isExternalLoading}
          disabled={isExternalLoading}
          getOptionLabel={(option) => {
            // Verificar se option é um objeto com propriedade name ou é apenas o ID
            if (typeof option === 'object' && option !== null && 'name' in option) {
              return option.name;
            }
            
            // Se for o ID, tenta encontrar o produto correspondente
          
            
            // Se for o ID como string
            if (typeof option === 'string' && !isNaN(Number(option))) {
              const representative = representatives.find(p => p.username === option);
              return representative ? representative.name : `Representante #${option}`;
            }
            
            // Qualquer outro caso
            return String(option);
          }}
          value={selectedRepresentative || (field.value ? field.value : null)}
          onChange={(_, newValue) => {
            if (newValue) {
              setValue(name, newValue.username);
              setSelectedRepresentative(newValue);
            } else {
              setValue(name, null);
              setSelectedRepresentative(null);
            }
          }}
          onKeyDown={handleKeyDown}
          renderInput={(params) => (
            <TextField
              {...params}
              {...rest}
              label="Representante"
              error={!!error}
              helperText={error?.message}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading || isExternalLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      )}
    />
  );
};