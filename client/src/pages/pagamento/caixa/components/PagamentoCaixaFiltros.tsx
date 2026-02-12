import { useState, useCallback, useEffect } from 'react';
import { Box, TextField, MenuItem, useMediaQuery, Theme } from '@mui/material';
import dayjs from 'dayjs';
import { PagamentoService } from '../../../../api/services/PagamentoService';
import { FilterButton, IFilterInputs } from '../../../../components/contents/FilterButton';

interface IOption {
  id: string;
  label: string;
}

export interface IPagamentoCaixaFiltros {
  data_inicio: string;
  data_fim: string;
  caixa?: string;
  docente?: string;
}

interface IPagamentoCaixaFiltrosProps {
  onFilterChange: (filters: IPagamentoCaixaFiltros) => void;
  initialFilters: IPagamentoCaixaFiltros;
}

const DATE_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'this_month', label: 'Este Mês' },
  { value: 'last_month', label: 'Mês Passado' },
  { value: 'custom', label: 'Personalizado' }
];

export const PagamentoCaixaFiltros: React.FC<IPagamentoCaixaFiltrosProps> = ({
  onFilterChange,
  initialFilters,
}) => {

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const [filters, setFilters] = useState<IPagamentoCaixaFiltros>(initialFilters);
  const [dataAtiva] = useState(true);
  const [dateOption, setDateOption] = useState<string>('this_month');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [caixas, setCaixas] = useState<IOption[]>([]);
  const [docentes, setDocentes] = useState<IOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!dataAtiva) return;

    let newStartDate = '';
    let newEndDate = '';

    switch (dateOption) {
      case 'today':
        newStartDate = dayjs().format('YYYY-MM-DD');
        newEndDate = newStartDate;
        break;
      case 'yesterday':
        newStartDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
        newEndDate = newStartDate;
        break;
      case 'this_month':
        newStartDate = dayjs().startOf('month').format('YYYY-MM-DD');
        newEndDate = dayjs().format('YYYY-MM-DD');
        break;
      case 'last_month':
        newStartDate = dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
        newEndDate = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
        break;
      case 'custom':
        setShowCustomDate(true);
        return;
      default:
        break;
    }

    setShowCustomDate(false);
    updateFilters({
      ...filters,
      data_inicio: newStartDate,
      data_fim: newEndDate
    });
  }, [dateOption, dataAtiva]);

  const updateFilters = useCallback((newFilters: Partial<IPagamentoCaixaFiltros>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  }, [filters, onFilterChange]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (['data_inicio', 'data_fim'].includes(name)) {
      if ((value.substring(0, 1) !== '2') || (value.length !== 10)) {
        setFilters({ ...filters, [name]: value });
        return;
      }

      if (name === 'data_inicio' && dayjs(value).isAfter(dayjs(filters.data_fim))) {
        updateFilters({ data_inicio: value, data_fim: value });
        return;
      }

      if (name === 'data_fim' && dayjs(value).isBefore(dayjs(filters.data_inicio))) {
        updateFilters({ data_inicio: value, data_fim: value });
        return;
      }
    }

    updateFilters({ [name]: value });
  }, [updateFilters, filters]);

  const handleDateOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateOption(e.target.value);
  };

  const clearFilters = useCallback(() => {
    setDateOption('this_month');
    setShowCustomDate(false);
    updateFilters(initialFilters);
  }, [updateFilters, initialFilters]);

  const loadFilterData = async () => {
    setIsLoading(true);
    try {
      const response = await PagamentoService.getCaixaFiltrosOptions({
        data_inicio: filters.data_inicio,
        data_fim: filters.data_fim
      });

      if (!(response instanceof Error)) {
        setCaixas(response.caixas);
        setDocentes(response.docentes);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados de filtro:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFilterData();
  }, [filters.data_inicio, filters.data_fim]);

  const filterInputs: IFilterInputs = {
    content: [
      <TextField
        key="date_option"
        select
        size='small'
        label={'Período'}
        value={dateOption}
        onChange={handleDateOptionChange}
        sx={{ minWidth: 150 }}
      >
        {DATE_OPTIONS.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>,

      showCustomDate && (
        <TextField
          key="data_inicio"
          size='small'
          type='date'
          name="data_inicio"
          label={'Data inicial'}
          value={filters.data_inicio || ''}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
      ),

      showCustomDate && (
        <TextField
          key="data_fim"
          size='small'
          type='date'
          name="data_fim"
          label={'Data Final'}
          value={filters.data_fim || ''}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
      ),

      <TextField
        key="caixa"
        select
        size='small'
        name='caixa'
        label="Caixa"
        disabled={isLoading}
        value={filters.caixa || ''}
        onChange={handleFilterChange}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {caixas.map(a => (
          <MenuItem key={a.id} value={a.id}>{a.label}</MenuItem>
        ))}
      </TextField>,

      <TextField
        key="docente"
        select
        size='small'
        name='docente'
        label="Professora"
        disabled={isLoading}
        value={filters.docente || ''}
        onChange={handleFilterChange}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">Todas</MenuItem>
        {docentes.map(a => (
          <MenuItem key={a.id} value={a.id}>{a.label}</MenuItem>
        ))}
      </TextField>,
    ].filter(Boolean),
    isChecked: [
      dateOption === 'this_month',
      !filters.caixa,
      !filters.docente,
    ]
  };

  return (
    <Box display="flex" flexDirection="row" gap={2} alignItems="center" flexWrap="wrap">
      {smUp && (
        <>
          {(dateOption !== 'custom' || mdUp) &&
            <TextField
              select
              size='small'
              label={'Período'}
              value={dateOption}
              onChange={handleDateOptionChange}
              sx={{ minWidth: 150 }}
            >
              {DATE_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>}

          {showCustomDate && (
            <>
              <TextField
                size='small'
                type='date'
                name="data_inicio"
                label={'Data inicial'}
                value={filters.data_inicio || ''}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
              <TextField
                size='small'
                type='date'
                name="data_fim"
                label={'Data Final'}
                value={filters.data_fim || ''}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
            </>
          )}
        </>
      )}

      <FilterButton
        filterInputs={filterInputs}
        clear={clearFilters}
        disabled={false}
      />
    </Box>
  );
};
