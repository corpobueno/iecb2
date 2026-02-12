import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

type TVCityFieldProps = Omit<TextFieldProps, 'name'> & {
    name: string;
    stateFieldName: string;
}

interface City {
    id: number;
    nome: string;
}

export const VCityField: React.FC<TVCityFieldProps> = ({ name, stateFieldName, ...rest }) => {
    const { control, watch, setValue, setError, clearErrors } = useFormContext();
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);

    const stateValue = watch(stateFieldName);

    useEffect(() => {
        if (stateValue && stateValue.length === 2) {
            loadCitiesForState(stateValue);
        } else {
            setCities([]);
        }
    }, [stateValue]);

    const loadCitiesForState = async (state: string) => {
        setLoading(true);
        try {
            const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`);
            const data: City[] = await response.json();
            setCities(data);
            clearErrors('city');
        } catch (error) {
            console.error('Erro ao carregar cidades:', error);
            setError('city', { type: 'manual', message: 'Erro ao carregar cidades' });
        } finally {
            setLoading(false);
        }
    };

    const handleFocus = () => {
        if (!stateValue || stateValue.length !== 2) {
            setError('city', { type: 'manual', message: 'Selecione um estado primeiro' });
            setCities([]);
        }
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <Autocomplete
                    noOptionsText="Sem opções"
                    disablePortal
                    fullWidth
                    options={cities}
                    loading={loading}
                    disabled={!stateValue || stateValue.length !== 2 || rest.disabled}
                    getOptionLabel={(option) => {
                        // Handle both string values and City objects
                        if (typeof option === 'string') {
                            return option;
                        }
                        return option.nome;
                    }}
                    value={field.value || null}
                    onChange={(_, newValue) => {
                        if (typeof newValue === 'string') {
                            setValue(name, newValue);
                        } else if (newValue) {
                            setValue(name, newValue.nome);
                        } else {
                            setValue(name, '');
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            {...rest}
                            error={!!error}
                            helperText={error?.message}
                            onFocus={handleFocus}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    )}
                />
            )}
        />
    );
};