import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { Box, TextField, Chip, Typography, InputAdornment, Popover } from '@mui/material';
import { Calculator } from 'lucide-react';

interface MeasurementInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onNext?: () => void; // Chamado quando Enter/Tab é pressionado
  inputRef?: React.RefObject<HTMLInputElement>;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Input especial para medições (length/width) com funcionalidade de soma interna.
 *
 * Funcionalidades:
 * - Digite um número normalmente para definir o valor
 * - Pressione "+" após um número para iniciar o modo de soma (ex: "1,5+")
 * - No modo de soma, continue adicionando valores com "+"
 * - Pressione Enter para calcular a soma e aplicar ao campo
 * - Tab/Enter navegam para o próximo campo
 */
export const MeasurementInput = ({
  label,
  value,
  onChange,
  onNext,
  inputRef: externalRef,
  size = 'small',
  fullWidth = true,
  disabled = false,
  autoFocus = false,
}: MeasurementInputProps) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = externalRef || internalRef;

  // Estado para o modo de soma
  const [isSumMode, setIsSumMode] = useState(false);
  const [sumValues, setSumValues] = useState<number[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [displayValue, setDisplayValue] = useState(value > 0 ? value.toString() : '');

  // Refs para evitar problemas de closure stale
  // Armazenamos os valores críticos em refs para acesso imediato
  const sumValuesRef = useRef<number[]>([]);
  const currentInputRef = useRef('');
  const isSumModeRef = useRef(false);
  const isFinalizingRef = useRef(false);

  // Sincroniza refs com estado
  useEffect(() => {
    sumValuesRef.current = sumValues;
  }, [sumValues]);

  useEffect(() => {
    currentInputRef.current = currentInput;
  }, [currentInput]);

  useEffect(() => {
    isSumModeRef.current = isSumMode;
  }, [isSumMode]);

  // Flag para evitar que o useEffect sobrescreva o displayValue após finalização
  const justFinalizedRef = useRef(false);

  // Atualiza o displayValue quando o value externo muda
  useEffect(() => {
    // Se acabamos de finalizar uma soma, pula esta atualização
    if (justFinalizedRef.current) {
      justFinalizedRef.current = false;
      return;
    }
    if (!isSumMode) {
      setDisplayValue(value > 0 ? value.toString() : '');
    }
  }, [value, isSumMode]);

  // Converte string para número (aceita vírgula ou ponto)
  const parseNumber = (str: string): number => {
    if (!str || str.trim() === '') return 0;
    const normalized = str.replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
  };

  // Calcula o total da soma usando os valores dos refs (sempre atualizados)
  const calculateSumFromRefs = (): number => {
    const values = sumValuesRef.current;
    const current = currentInputRef.current;
    const currentNum = parseNumber(current);
    const total = values.reduce((acc, val) => acc + val, 0) + currentNum;
    return Math.round(total * 1000) / 1000; // Arredonda para 3 casas decimais
  };

  // Calcula o total da soma (para exibição no Popover)
  const calculateSum = (values: number[], current: string): number => {
    const currentNum = parseNumber(current);
    const total = values.reduce((acc, val) => acc + val, 0) + currentNum;
    return Math.round(total * 1000) / 1000;
  };

  // Formata número para exibição
  const formatNumber = (num: number): string => {
    if (num === 0) return '0';
    return num.toString().replace('.', ',');
  };

  // Processa o "+" - adiciona valor atual à lista de soma
  const handlePlusPressed = () => {
    const currentNum = parseNumber(currentInputRef.current || displayValue);

    if (!isSumModeRef.current) {
      // Entra no modo de soma
      if (currentNum > 0) {
        setIsSumMode(true);
        isSumModeRef.current = true;
        setSumValues([currentNum]);
        sumValuesRef.current = [currentNum];
        setCurrentInput('');
        currentInputRef.current = '';
        setDisplayValue('');
      }
    } else {
      // Adiciona mais um valor à soma
      if (currentNum > 0) {
        const newValues = [...sumValuesRef.current, currentNum];
        setSumValues(newValues);
        sumValuesRef.current = newValues;
        setCurrentInput('');
        currentInputRef.current = '';
      }
    }
  };

  // Finaliza a soma e aplica o valor
  // IMPORTANTE: Usa refs em vez de estado para evitar problemas de closure stale
  const finalizeSumAndNavigate = (shouldNavigate: boolean = true) => {
    // Previne chamadas duplicadas
    if (isFinalizingRef.current) {
      return;
    }

    if (isSumModeRef.current) {
      isFinalizingRef.current = true;

      // Calcula usando refs para garantir valores atualizados
      const total = calculateSumFromRefs();

      // Define a flag ANTES de chamar onChange e setState
      justFinalizedRef.current = true;

      // Chama onChange com o valor calculado
      onChange(total);

      // Atualiza o displayValue
      setDisplayValue(total > 0 ? total.toString() : '');

      // Reseta o estado
      setIsSumMode(false);
      isSumModeRef.current = false;
      setSumValues([]);
      sumValuesRef.current = [];
      setCurrentInput('');
      currentInputRef.current = '';

      // Libera o lock após um pequeno delay
      setTimeout(() => {
        isFinalizingRef.current = false;
      }, 50);

      if (shouldNavigate) {
        setTimeout(() => onNext?.(), 10);
      }
    } else {
      const num = parseNumber(currentInputRef.current || displayValue);
      if (num !== value) {
        onChange(num);
      }
      if (shouldNavigate) {
        onNext?.();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Tecla + inicia ou continua o modo de soma
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      e.stopPropagation();
      handlePlusPressed();
      return;
    }

    // Enter confirma a soma ou navega para o próximo
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation(); // Evita que o evento propague para handlers do pai
      finalizeSumAndNavigate(true);
      return;
    }

    // Tab navega para o próximo (comportamento similar ao Enter)
    if (e.key === 'Tab') {
      if (isSumModeRef.current) {
        e.preventDefault();
        finalizeSumAndNavigate(true);
      } else {
        // Aplica o valor atual antes do Tab natural
        const num = parseNumber(currentInputRef.current || displayValue);
        if (num !== value) {
          onChange(num);
        }
      }
      return;
    }

    // Escape cancela o modo de soma
    if (e.key === 'Escape' && isSumModeRef.current) {
      e.preventDefault();
      setIsSumMode(false);
      isSumModeRef.current = false;
      setSumValues([]);
      sumValuesRef.current = [];
      setCurrentInput('');
      currentInputRef.current = '';
      setDisplayValue(value > 0 ? value.toString() : '');
      return;
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Detecta se o usuário digitou "+" (pode não ter sido capturado pelo keyDown)
    if (inputValue.includes('+')) {
      // Pega o valor antes do "+"
      const parts = inputValue.split('+');
      const valueBeforePlus = parts[0];

      // Atualiza o input atual com o valor antes do "+"
      if (valueBeforePlus) {
        const filtered = valueBeforePlus.replace(/[^\d.,]/g, '');
        if (isSumModeRef.current) {
          setCurrentInput(filtered);
          currentInputRef.current = filtered;
        } else {
          setCurrentInput(filtered);
          currentInputRef.current = filtered;
          setDisplayValue(filtered);
        }
      }

      // Processa o "+"
      setTimeout(() => handlePlusPressed(), 0);
      return;
    }

    // Permite apenas números, vírgula e ponto
    const filtered = inputValue.replace(/[^\d.,]/g, '');

    if (isSumModeRef.current) {
      setCurrentInput(filtered);
      currentInputRef.current = filtered;
    } else {
      setCurrentInput(filtered);
      currentInputRef.current = filtered;
      setDisplayValue(filtered);

      // Atualiza o valor em tempo real
      const num = parseNumber(filtered);
      onChange(num);
    }
  };

  const handleBlur = () => {
    // Usa ref para verificar o estado atual (evita closure stale)
    if (isSumModeRef.current && !isFinalizingRef.current) {
      // Se sair do campo no modo soma, aplica o valor
      finalizeSumAndNavigate(false);
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
        onClose={() => {}} // Não fecha ao clicar fora - controlado pelo modo soma
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

export default MeasurementInput;
