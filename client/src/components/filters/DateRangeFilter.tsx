import { useState, useCallback, useEffect } from 'react';
import { TextField, MenuItem, Box } from '@mui/material';
import dayjs from 'dayjs';

export interface DateRangeValue {
  startDate: string;
  endDate: string;
}

interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  defaultOption?: string;
  size?: 'small' | 'medium';
  labels?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  };
}

// Date options
const DATE_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'this_week', label: 'Esta semana' },
  { value: 'last_week', label: 'Semana passada' },
  { value: 'this_month', label: 'Este mês' },
  { value: 'last_month', label: 'Mês passado' },
  { value: 'last_3_months', label: 'Últimos 3 meses' },
  { value: 'last_6_months', label: 'Últimos 6 meses' },
  { value: 'this_year', label: 'Este ano' },
  { value: 'custom', label: 'Personalizado' },
];

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  defaultOption = 'this_month',
  size = 'small',
  labels = {},
}) => {
  const [dateOption, setDateOption] = useState<string>(defaultOption);
  const [showCustomDate, setShowCustomDate] = useState(false);

  const setDate = (type: string) => {
    switch (type) {

      case 'today': return dayjs().format('YYYY-MM-DD');
      case 'yesterday': return dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      case 'weekStart': return dayjs().startOf('week').format('YYYY-MM-DD');
      case 'weekEnd': return dayjs().endOf('week').format('YYYY-MM-DD');
      case 'lastWeekStart': return dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
      case 'lastWeekEnd': return dayjs().subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
      case 'monthStart': return dayjs().startOf('month').format('YYYY-MM-DD');
      case 'monthEnd': return dayjs().endOf('month').format('YYYY-MM-DD');
      case 'lastMonthStart': return dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
      case 'lastMonthEnd': return dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
      case 'last3MonthsStart': return dayjs().subtract(2, 'months').startOf('month').format('YYYY-MM-DD');
      case 'last6MonthsStart': return dayjs().subtract(5, 'months').startOf('month').format('YYYY-MM-DD');
      case 'yearStart': return dayjs().startOf('year').format('YYYY-MM-DD');
      case 'yearEnd': return dayjs().endOf('year').format('YYYY-MM-DD');
      default: return ''
    }
  }

  // Detectar se as datas atuais correspondem a alguma opção pré-definida
  useEffect(() => {
    if (!value.startDate || !value.endDate) return;

    if (value.startDate === setDate('today') && value.endDate === setDate('today')) {
      setDateOption('today');
      setShowCustomDate(false);
    } else if (value.startDate === setDate('yesterday') && value.endDate === setDate('yesterday')) {
      setDateOption('yesterday');
      setShowCustomDate(false);
    } else if (value.startDate === setDate('weekStart') && value.endDate === setDate('weekEnd')) {
      setDateOption('this_week');
      setShowCustomDate(false);
    } else if (value.startDate === setDate('lastWeekStart') && value.endDate === setDate('lastWeekEnd')) {
      setDateOption('last_week');
      setShowCustomDate(false);
    } else if (value.startDate === setDate('monthStart') && value.endDate === setDate('monthEnd')) {
      setDateOption('this_month');
      setShowCustomDate(false);
    } else if (value.startDate === setDate('lastMonthStart') && value.endDate === setDate('lastMonthEnd')) {
      setDateOption('last_month');
      setShowCustomDate(false);
    } else if (value.startDate === setDate('last3MonthsStart') && value.endDate === setDate('monthEnd')) {
      setDateOption('last_3_months');
      setShowCustomDate(false);
    } else if (value.startDate === setDate('last6MonthsStart') && value.endDate === setDate('monthEnd')) {
      setDateOption('last_6_months');
      setShowCustomDate(false);
    } else if (value.startDate === setDate('yearStart') && value.endDate === setDate('yearEnd')) {
      setDateOption('this_year');
      setShowCustomDate(false);
    } else {
      setDateOption('custom');
      setShowCustomDate(true);
    }
  }, [value.startDate, value.endDate]);

  const handleDateOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOption = e.target.value;
    setDateOption(newOption);

    if (newOption === 'custom') {
      setShowCustomDate(true);
      return;
    }

    let newStartDate = '';
    let newEndDate = '';

    switch (newOption) {
      case 'today':
        newStartDate = setDate('today');
        newEndDate = setDate('today');
        break;
      case 'yesterday':
        newStartDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
        newEndDate = newStartDate;
        break;
      case 'this_week':
        newStartDate = dayjs().startOf('week').format('YYYY-MM-DD');
        newEndDate = dayjs().endOf('week').format('YYYY-MM-DD');
        break;
      case 'last_week':
        newStartDate = setDate('lastWeekStart');
        newEndDate = setDate('lastWeekEnd');
        break;
      case 'this_month':
        newStartDate = dayjs().startOf('month').format('YYYY-MM-DD');
        newEndDate = dayjs().endOf('month').format('YYYY-MM-DD');
        break;
      case 'last_month':
        newStartDate = dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
        newEndDate = dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
        break;
      case 'last_3_months':
        newStartDate = dayjs().subtract(2, 'months').startOf('month').format('YYYY-MM-DD');
        newEndDate = dayjs().endOf('month').format('YYYY-MM-DD');
        break;
      case 'last_6_months':
        newStartDate = dayjs().subtract(5, 'months').startOf('month').format('YYYY-MM-DD');
        newEndDate = dayjs().endOf('month').format('YYYY-MM-DD');
        break;
      case 'this_year':
        newStartDate = dayjs().startOf('year').format('YYYY-MM-DD');
        newEndDate = dayjs().endOf('year').format('YYYY-MM-DD');
        break;
      default:
        return;
    }

    setShowCustomDate(false);
    onChange({
      startDate: newStartDate,
      endDate: newEndDate,
    });
  };

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value: inputValue } = e.target;

      // Validação básica
      if (!inputValue || inputValue.length !== 10 || !inputValue.startsWith('20')) {
        return;
      }

      // Validação de datas
      if (name === 'startDate' && dayjs(inputValue).isAfter(dayjs(value.endDate))) {
        onChange({
          startDate: inputValue,
          endDate: inputValue,
        });
        return;
      }

      if (name === 'endDate' && dayjs(inputValue).isBefore(dayjs(value.startDate))) {
        onChange({
          startDate: inputValue,
          endDate: inputValue,
        });
        return;
      }

      onChange({
        ...value,
        [name]: inputValue,
      });
    },
    [value, onChange]
  );

  return (
    <Box display="flex" flexDirection="row" gap={2} alignItems="center" flexWrap="wrap">
      <TextField
        select
        size={size}
        label={labels.period || 'Período'}
        value={dateOption}
        onChange={handleDateOptionChange}
        sx={{ minWidth: 180 }}
      >
        {DATE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      {showCustomDate && (
        <>
          <TextField
            size={size}
            type="date"
            name="startDate"
            label={labels.startDate || 'Data inicial'}
            value={value.startDate || ''}
            onChange={handleDateChange}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />

          <TextField
            size={size}
            type="date"
            name="endDate"
            label={labels.endDate || 'Data final'}
            value={value.endDate || ''}
            onChange={handleDateChange}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />
        </>
      )}
    </Box>
  );
};
