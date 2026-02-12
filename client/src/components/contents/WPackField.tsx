import React, { useEffect, useState, useCallback } from 'react';
import { Autocomplete, TextField, TextFieldProps, CircularProgress } from '@mui/material';
import { PackService } from '../../api/services/PackService';
import { IPack } from '../../entities/Pack';
import { useDebounce } from '../../hooks/UseDebounce';

type TWPackFieldProps = Omit<TextFieldProps, 'name' | 'value' | 'onChange'> & {
  name: string;
  value: number | null;
  handleChange: (value: number | null) => void;
  isExternalLoading?: boolean;
  label?: string;
  clientId?: number | null; // ID do cliente para buscar preço personalizado
  onPackSelected?: (pack: IPack | null) => void; // Callback quando um pack é selecionado
  priceFieldOnChange?: (price: number) => void; // Callback para preencher preço automaticamente
  minPriceFieldOnChange?: (minPrice: number) => void; // Callback para preencher preço mínimo
  error?: boolean;
  helperText?: string;
}

export const WPackField: React.FC<TWPackFieldProps> = ({
  name,
  value,
  handleChange,
  isExternalLoading = false,
  label = 'Pack',
  clientId,
  onPackSelected,
  priceFieldOnChange,
  minPriceFieldOnChange,
  error,
  helperText,
  ...rest
}) => {
  const [packs, setPacks] = useState<IPack[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState<IPack | null>(null);
  const [searchText, setSearchText] = useState('');

  const { debounce } = useDebounce();

  // Carrega a lista de packs com base no texto de busca
  const loadPacks = useCallback(async (filter?: string) => {
    setLoading(true);
    try {
      const response = await PackService.getToTransaction(filter ?? '', clientId ?? undefined);
      if (!(response instanceof Error)) {
        setPacks(response);
      } else {
        console.error("Erro ao carregar packs:", response.message);
        setPacks([]);
      }
    } catch (error) {
      console.error("Erro ao carregar packs:", error);
      setPacks([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Carrega o pack selecionado quando o valor muda
  useEffect(() => {
    if (value && typeof value === 'number' && value > 0) {
      loadPackById(value);
    } else {
      setSelectedPack(null);
    }
  }, [value]);

  // Carrega packs quando o texto de busca ou clientId muda (com debounce)
  useEffect(() => {
    debounce(() => loadPacks(searchText));
  }, [searchText, clientId, debounce, loadPacks]);

  const loadPackById = async (id: number) => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await PackService.getById(id);
      if (!(response instanceof Error)) {
        setSelectedPack(response);
        // Adiciona o pack carregado à lista se ele não estiver lá
        setPacks(prevPacks => {
          if (!prevPacks.find(p => p.id === response.id)) {
            return [response, ...prevPacks];
          }
          return prevPacks;
        });
      } else {
        setSelectedPack(null);
      }
    } catch (error) {
      console.error("Erro ao carregar pack por ID:", error);
      setSelectedPack(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (!form) return;

      const inputs = Array.from(form.querySelectorAll('input, select, textarea, button')) as HTMLElement[];
      const current = document.activeElement;
      const index = inputs.indexOf(current as HTMLElement);
      if (index > -1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      } else {
        const submitBtn = form.querySelector('button[type="submit"], button[aria-label*="add"], button[aria-label*="incluir"]') as HTMLElement;
        submitBtn?.focus();
      }
    }
  };

  return (
    <Autocomplete
      options={packs}
      loading={loading || isExternalLoading}
      disabled={isExternalLoading}
      value={selectedPack ?? packs.find(p => p.id === value) ?? null}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === 'input') {
          setSearchText(newInputValue);
        } else if (reason === 'clear') {
          setSearchText('');
          handleChange(null);
          setSelectedPack(null);
          onPackSelected?.(null);
          priceFieldOnChange?.(0);
          minPriceFieldOnChange?.(0);
        }
      }}
      onChange={(_, newValue) => {
        if (newValue && typeof newValue === 'object' && 'id' in newValue) {
          handleChange(newValue.id);
          setSelectedPack(newValue);
          setSearchText(newValue.name);
          onPackSelected?.(newValue);

          // Preenche automaticamente o preço (usa clientPrice se disponível, senão usa price padrão)
          if (priceFieldOnChange) {
            console.log('Selected pack:', newValue);
            const priceToUse = newValue.clientPrice ?? newValue.price;
            priceFieldOnChange(priceToUse);
          }

          // Preenche automaticamente o preço mínimo
          if (minPriceFieldOnChange) {
            minPriceFieldOnChange(newValue.minPrice ?? 0);
          }
        } else {
          handleChange(null);
          setSelectedPack(null);
          onPackSelected?.(null);
          priceFieldOnChange?.(0);
          minPriceFieldOnChange?.(0);
        }
      }}
      getOptionLabel={(option) => {
        if (typeof option === 'object' && option !== null) {
          return option.name || '';
        }
        return '';
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      filterOptions={(x) => x} // Desabilitar filtro interno, pois filtramos via API
      onKeyDown={handleKeyDown}
      renderInput={(params) => (
        <TextField
          {...params}
          {...rest}
          name={name}
          label={label}
          error={error}
          helperText={helperText}
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
