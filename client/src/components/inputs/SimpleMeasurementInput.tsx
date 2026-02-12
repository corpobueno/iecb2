import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { Box, TextField, Chip, Typography, InputAdornment, Popover } from '@mui/material';
import { Calculator } from 'lucide-react';

interface SimpleMeasurementInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Input simplificado para medidas com funcionalidade de soma.
 *
 * Funcionalidades:
 * - Digite um numero normalmente para definir o valor
 * - Pressione "+" apos um numero para iniciar o modo de soma (ex: "1,5+")
 * - No modo de soma, continue adicionando valores com "+"
 * - Pressione Enter para calcular a soma
 * - Tab funciona normalmente (passa para o proximo campo)
 *
 * NOTA: Este componente NAO tem navegacao especial. Tab e Enter
 * funcionam de forma padrao sem interferir com outros elementos.
 */
export const SimpleMeasurementInput = ({
  label,
  value,
  onChange,
  inputRef: externalRef,
  size = 'small',
  fullWidth = true,
  disabled = false,
  autoFocus = false,
}: SimpleMeasurementInputProps) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = externalRef || internalRef;

  // Estado para o modo de soma
  const [isSumMode, setIsSumMode] = useState(false);
  const [sumValues, setSumValues] = useState<number[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [displayValue, setDisplayValue] = useState(value > 0 ? value.toString() : '');

  // Atualiza o displayValue quando o value externo muda
  useEffect(() => {
    if (!isSumMode) {
      setDisplayValue(value > 0 ? value.toString() : '');
    }
  }, [value, isSumMode]);

  // Converte string para numero (aceita virgula ou ponto)
  const parseNumber = (str: string): number => {
    if (!str || str.trim() === '') return 0;
    const normalized = str.replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
  };

  // Calcula o total da soma
  const calculateSum = (values: number[], current: string): number => {
    const currentNum = parseNumber(current);
    const total = values.reduce((acc, val) => acc + val, 0) + currentNum;
    return Math.round(total * 1000) / 1000;
  };

  // Formata numero para exibicao
  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    return num.toString().replace('.', ',');
  };

  // Processa o "+" - adiciona valor atual a lista de soma
  const handlePlusPressed = () => {
    const currentNum = parseNumber(currentInput || displayValue);

    if (!isSumMode) {
      // Entra no modo de soma
      if (currentNum > 0) {
        setIsSumMode(true);
        setSumValues([currentNum]);
        setCurrentInput('');
        setDisplayValue('');
      }
    } else {
      // Adiciona mais um valor a soma
      if (currentNum > 0) {
        setSumValues(prev => [...prev, currentNum]);
        setCurrentInput('');
      }
    }
  };

  // Finaliza a soma e aplica o valor
  const finalizeSum = () => {
    if (isSumMode) {
      const total = calculateSum(sumValues, currentInput);
      onChange(total);
      setDisplayValue(total > 0 ? total.toString() : '');
      setIsSumMode(false);
      setSumValues([]);
      setCurrentInput('');
    } else {
      const num = parseNumber(currentInput || displayValue);
      if (num !== value) {
        onChange(num);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Tecla + inicia ou continua o modo de soma
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      handlePlusPressed();
      return;
    }

    // Enter confirma a soma (mas NAO navega para lugar nenhum)
    if (e.key === 'Enter') {
      if (isSumMode) {
        e.preventDefault();
        finalizeSum();
      }
      // Se nao estiver em modo soma, deixa o Enter funcionar normalmente
      return;
    }

    // Tab funciona normalmente - apenas finaliza a soma se estiver no modo
    if (e.key === 'Tab' && isSumMode) {
      finalizeSum();
      // NAO previne o comportamento padrao do Tab
      return;
    }

    // Escape cancela o modo de soma
    if (e.key === 'Escape' && isSumMode) {
      e.preventDefault();
      setIsSumMode(false);
      setSumValues([]);
      setCurrentInput('');
      setDisplayValue(value > 0 ? value.toString() : '');
      return;
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Detecta se o usuario digitou "+"
    if (inputValue.includes('+')) {
      const parts = inputValue.split('+');
      const valueBeforePlus = parts[0];

      if (valueBeforePlus) {
        const filtered = valueBeforePlus.replace(/[^\d.,]/g, '');
        setCurrentInput(filtered);
        if (!isSumMode) {
          setDisplayValue(filtered);
        }
      }

      setTimeout(() => handlePlusPressed(), 0);
      return;
    }

    // Permite apenas numeros, virgula e ponto
    const filtered = inputValue.replace(/[^\d.,]/g, '');

    if (isSumMode) {
      setCurrentInput(filtered);
    } else {
      setCurrentInput(filtered);
      setDisplayValue(filtered);
      // Atualiza o valor em tempo real
      const num = parseNumber(filtered);
      onChange(num);
    }
  };

  const handleBlur = () => {
    if (isSumMode) {
      finalizeSum();
    }
  };

  // Ref para o container do input (para ancorar o Popover)
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Box ref={containerRef} sx={{ width: fullWidth ? '100%' : 'auto', position: 'relative' }}>
      {/* Popover da Soma */}
      <Popover
        open={isSumMode && sumValues.length > 0}
        anchorEl={containerRef.current}
        onClose={() => {}}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: {
              p: 1.5,
              bgcolor: '#fff',
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'info.main',
              boxShadow: 3,
              minWidth: 200,
              maxWidth: 350,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Calculator size={18} style={{ color: '#1976d2' }} />
          <Typography variant="subtitle2" color="info.main" fontWeight="bold">
            Calculadora
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {sumValues.map((val, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                label={formatNumber(val)}
                size="small"
                color="info"
                sx={{ height: 26, fontSize: '0.85rem', fontWeight: 'bold' }}
              />
              <Typography variant="body1" sx={{ mx: 0.5, fontWeight: 'bold', color: 'info.main' }}>
                +
              </Typography>
            </Box>
          ))}
          {currentInput ? (
            <Chip
              label={currentInput}
              size="small"
              variant="outlined"
              color="info"
              sx={{ height: 26, fontSize: '0.85rem' }}
            />
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ px: 1 }}>
              ?
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1,
            mt: 1,
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
            =
          </Typography>
          <Chip
            label={formatNumber(calculateSum(sumValues, currentInput))}
            size="small"
            color="primary"
            sx={{ height: 28, fontSize: '0.9rem', fontWeight: 'bold', px: 1 }}
          />
        </Box>
      </Popover>

      <TextField
        inputRef={inputRef}
        label={label}
        value={isSumMode ? currentInput : displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={isSumMode ? 'Digite valor e + ou Enter' : '0'}
        InputProps={{
          endAdornment: isSumMode ? (
            <InputAdornment position="end">
              <Chip
                label="SOMA"
                size="small"
                color="info"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </InputAdornment>
          ) : null,
        }}
        sx={{
          '& .MuiOutlinedInput-root': isSumMode ? {
            '& fieldset': {
              borderColor: 'info.main',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: 'info.dark',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'info.main',
            },
          } : {},
        }}
        helperText={isSumMode ? '+ adicionar | Enter confirmar | Esc cancelar' : undefined}
      />
    </Box>
  );
};

export default SimpleMeasurementInput;
