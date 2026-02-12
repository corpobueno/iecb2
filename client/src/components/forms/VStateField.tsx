import React, { useEffect, useState } from 'react';
import { Autocomplete, Box, TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type TVStateFieldProps = Omit<TextFieldProps, 'name'> & {
  name: string;
  defaultValue?: string;
}

interface State {
  id: number;
  sigla: string;
  nome: string;
}

export const VStateField: React.FC<TVStateFieldProps> = ({ name, defaultValue = 'go', ...rest }) => {
  const { control, setValue } = useFormContext();
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
      const data: State[] = await response.json();
      setStates(data.sort((a, b) => a.nome.localeCompare(b.nome)));
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para encontrar o estado pelo código
  const findStateByCode = (code: string): State | undefined => {
    return states.find(state => state.sigla.toLowerCase() === code.toLowerCase());
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field, fieldState: { error } }) => {
        // Encontrar o objeto de estado correspondente ao valor atual
        const currentState = field.value ? findStateByCode(field.value) : null;

        return (
          <Autocomplete
            options={states}
            loading={loading}
            getOptionLabel={(option) => {
              // Handle both string values and State objects
              if (typeof option === 'string') {
                const state = findStateByCode(option);
                return state ? `${state.sigla.toUpperCase()}` : String(option).toUpperCase();
              }
              return `${option.sigla.toUpperCase()}`;
            }}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <strong>{option.sigla.toUpperCase()}</strong>
              </Box>
            )}
            value={currentState}
            onChange={(_, newValue) => {
              if (typeof newValue === 'string') {
                setValue(name, String(newValue).toLowerCase());
              } else if (newValue) {
                setValue(name, newValue.sigla.toLowerCase());
              } else {
                setValue(name, defaultValue);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                {...rest}
                error={!!error}
                helperText={error?.message}
                InputLabelProps={{
                  shrink: true
                }}
                // Usar o valor em maiúsculas para exibição
                placeholder={field.value ? field.value.toUpperCase() : undefined}
              />
            )}
          />
        );
      }}
    />
  );
};