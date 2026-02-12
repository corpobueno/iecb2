import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, TextFieldProps, CircularProgress, createFilterOptions } from '@mui/material';

type TWCategoryFieldProps = Omit<TextFieldProps, 'name' | 'value' | 'onChange'> & {
  name: string;
  value: string;
  handleChange: (value: string) => void;
  loadCategories: () => Promise<string[] | Error>;
  isExternalLoading?: boolean;
  label?: string;
  placeholder?: string;
}

// Interface para opções que podem ser strings ou objetos "Adicionar..."
interface CategoryOption {
  inputValue: string;
  title: string;
}

type OptionType = string | CategoryOption;

const filter = createFilterOptions<OptionType>();

/**
 * Campo de categoria com Autocomplete
 * Permite selecionar uma categoria existente ou digitar uma nova
 */
export const WCategoryField: React.FC<TWCategoryFieldProps> = ({
  name,
  value,
  handleChange,
  loadCategories,
  isExternalLoading = false,
  label = 'Categoria',
  placeholder = 'Selecione ou digite uma categoria',
  ...rest
}) => {
  const [categories, setCategories] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  // Carrega as categorias ao montar o componente
  useEffect(() => {
    loadCategoriesData();
  }, []);

  // Sincroniza inputValue com value externo
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const loadCategoriesData = async () => {
    setLoading(true);
    try {
      const response = await loadCategories();
      if (!(response instanceof Error)) {
        setCategories(response);
      } else {
        console.error("Erro ao carregar categorias:", response.message);
        setCategories([]);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Autocomplete<OptionType, false, false, true>
      value={value || null}
      onChange={(_event, newValue) => {
        if (typeof newValue === 'string') {
          // Valor digitado diretamente (freeSolo)
          handleChange(newValue);
        } else if (newValue && typeof newValue === 'object') {
          // Valor criado pelo usuário (opção "Adicionar...")
          handleChange(newValue.inputValue);
        } else {
          // Valor null/undefined
          handleChange('');
        }
      }}
      inputValue={inputValue}
      onInputChange={(_event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Sugere a criação de um novo valor se o input não estiver vazio e não existir nas opções
        const isExisting = options.some((option) => {
          if (typeof option === 'string') {
            return inputValue.toLowerCase() === option.toLowerCase();
          }
          return false;
        });

        if (inputValue !== '' && !isExisting) {
          filtered.push({
            inputValue,
            title: `Adicionar "${inputValue}"`,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      freeSolo
      options={categories}
      getOptionLabel={(option) => {
        // Valor selecionado ou digitado (string)
        if (typeof option === 'string') {
          return option;
        }
        // Opção "Adicionar..." criada (objeto)
        if (option && typeof option === 'object') {
          return option.inputValue;
        }
        return '';
      }}
      renderOption={(props, option) => {
        // Se for uma opção "Adicionar..."
        if (typeof option === 'object') {
          return <li {...props}>{option.title}</li>;
        }
        // Opção normal da lista (string)
        return <li {...props}>{option}</li>;
      }}
      loading={loading || isExternalLoading}
      disabled={isExternalLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          {...rest}
          name={name}
          label={label}
          placeholder={placeholder}
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
  );
};
