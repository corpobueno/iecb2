import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Configuração do Day.js
dayjs.locale('pt-br');
dayjs.extend(customParseFormat);

/**
 * Função auxiliar que normaliza diferentes formatos de data para um objeto dayjs válido.
 * Verifica o formato da data recebida e retorna um objeto dayjs ou null se inválido.
 *
 * @param value - Valor de data em string, número, Date ou undefined/null
 * @returns Objeto dayjs válido ou null se a data for inválida
 */
function normalizeDateToDayjs(value: string | number | Date | null | undefined): dayjs.Dayjs | null {
  if (value === null || value === undefined) {
    return null;
  }

  try {
    // Se for número ou Date, usa o construtor direto do dayjs
    if (typeof value === 'number' || value instanceof Date) {
      const date = dayjs(value);
      return date.isValid() ? date : null;
    }

    // Se for string, tenta parsear com formatos comuns
    if (typeof value === 'string') {
      const trimmedValue = value.trim();

      // Retorna null para strings vazias
      if (!trimmedValue) {
        return null;
      }

      // Formatos comuns de data
      const commonFormats = [
        'YYYY-MM-DD',                    // ISO date (2025-12-05)
        'YYYY-MM-DDTHH:mm:ss.SSSZ',     // ISO completo com timezone (2025-12-05T10:30:00.000Z)
        'YYYY-MM-DDTHH:mm:ss',          // ISO com tempo sem timezone (2025-12-05T10:30:00)
        'YYYY-MM-DD HH:mm:ss',          // ISO com espaço (2025-12-05 10:30:00)
        'DD/MM/YYYY',                   // Formato brasileiro (05/12/2025)
        'DD/MM/YYYY HH:mm:ss',          // Formato brasileiro com hora (05/12/2025 10:30:00)
        'MM/DD/YYYY',                   // Formato americano (12/05/2025)
        'YYYY/MM/DD',                   // ISO com barras (2025/12/05)
      ];

      // Tenta fazer parse com cada formato em strict mode
      for (const fmt of commonFormats) {
        const parsed = dayjs(trimmedValue, fmt, true);
        if (parsed.isValid()) {
          return parsed;
        }
      }

      // Se nenhum formato específico funcionou, tenta o parse padrão do dayjs
      const defaultParsed = dayjs(trimmedValue);
      if (defaultParsed.isValid()) {
        return defaultParsed;
      }
    }

    return null;
  } catch (error) {
    console.error('Error normalizing date:', value, error);
    return null;
  }
}

/**
 * Formata uma data para o formato especificado.
 *
 * @param value - Valor de data em string, número, Date ou undefined/null
 * @param outputFormat - Formato de saída desejado (padrão: 'DD/MM/YYYY')
 * @returns String formatada ou string vazia se a data for inválida
 */
export function formatDate(
  value: string | number | Date | null | undefined,
  outputFormat: string = 'DD/MM/YYYY'
): string {
  const date = normalizeDateToDayjs(value);
  return date ? date.format(outputFormat) : '';
}

/**
 * Formata uma data incluindo o dia da semana no formato: "Terça, 05/12/2025".
 *
 * @param value - Valor de data em string, número, Date ou undefined/null
 * @returns String formatada com dia da semana ou string vazia se a data for inválida
 */
export function formatDateWeek(value: string | number | Date | null | undefined): string {
  const date = normalizeDateToDayjs(value);

  if (!date) {
    return '';
  }

  // Formato: "Terça, 05/12/2025"
  const weekday = date.format('dddd');
  const formattedDate = date.format('DD/MM/YYYY');

  // Capitaliza a primeira letra do dia da semana
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  return `${capitalizedWeekday}, ${formattedDate}`;
}

export function toCash(value: number | string | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return (0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Converte uma string formatada em moeda brasileira para número.
 * Remove símbolos de moeda, pontos de milhar e converte vírgula decimal para ponto.
 * Exemplos: "R$ 1.234,56" -> 1234.56, "1.234,56" -> 1234.56, "1234,56" -> 1234.56
 */
export function parseCash(value: string | null | undefined): number {
  if (!value) return 0;

  // Remove o símbolo R$, espaços e pontos (separadores de milhar)
  const cleaned = value
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '');

  // Substitui a vírgula decimal por ponto
  const normalized = cleaned.replace(',', '.');

  // Converte para número
  const number = parseFloat(normalized);

  return isNaN(number) ? 0 : number;
}

/**
 * Formata um valor de data e hora para o formato DD/MM/YYYY HH:mm.
 * Aceita string (ISO 8601 ou outros formatos reconhecíveis), número (timestamp) ou objeto Date.
 * Retorna uma string vazia se a data for inválida.
 */
export function formatDateTime(value: string | number | Date | null | undefined): string {
  const date = normalizeDateToDayjs(value);
  return date ? date.format('DD/MM/YYYY HH:mm') : '';
}

/**
 * Converte um valor de data para o formato ISO (YYYY-MM-DD).
 * Útil para enviar datas para APIs.
 * Retorna null se a data for inválida.
 */
export function formatDateToISO(value: string | number | Date | null | undefined): string | null {
  const date = normalizeDateToDayjs(value);
  return date ? date.format('YYYY-MM-DD') : null;
}


export function toTel(telefone: string | null | undefined): string {
  let retorno = telefone || '';
  if (telefone) {
    const cleaned = telefone.replace(/\D/g, ''); // Remove caracteres não numéricos

    if(cleaned.substring(0, 2) !== '55') return telefone;

    if (cleaned.length === 13 ) { // Ex: 5511987654321
      retorno = `(${cleaned.substring(2, 4)}) ${cleaned.substring(4, 9)}-${cleaned.substring(9)}`;
    } else if (cleaned.length === 12) { // Ex: 551197654321
      retorno = `(${cleaned.substring(2, 4)}) ${cleaned.substring(4, 8)}-${cleaned.substring(8)}`;
    }  else if (cleaned.length === 11) { // Ex: 11987654321
      retorno = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else if (cleaned.length === 10) { // Ex: 1187654321
      retorno = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }
    // Adicionar mais lógicas se necessário para outros tamanhos
  } 
  return retorno;
}

/**
 * Combina a data atual com uma string de hora (HH:mm) para criar um objeto Date.
 * Retorna null se a hora for inválida.
 */
export function createDateWithTime(timeString: string | null | undefined): Date | null {
  if (!timeString || typeof timeString !== 'string') {
    return null;
  }
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  catch (error) {
    console.error('Error creating date with time:', timeString, error);
    return null;
  }
}

// A função addDateToTime original parecia ter um propósito muito específico.
// Se a intenção era criar uma string ISO com uma data fixa e a hora fornecida:
export function formatTimeToISODateString(timeValue: string | undefined): string {
  if (!!timeValue && timeValue.length >= 5) { // HH:mm
    // Valida o formato da hora se necessário
    const [hours, minutes] = timeValue.split(':');
    if (hours && minutes && hours.length === 2 && minutes.length === 2) {
        // Poderia usar date-fns para mais robustez aqui também
        // Exemplo: return format(set(new Date(), { hours: Number(hours), minutes: Number(minutes) }), "yyyy-MM-dd'T'HH:mm:ss");
        return `2000-01-01T${timeValue}:00`; // Mantendo a data fixa de exemplo, mas agora com segundos
    }
  }
  return '';
}


export function getStorage(key: string | undefined): any {
  if (!key) return {};
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : {};
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage`, error);
    return {};
  }
}

export function setStorage(key: string, value: string | number | undefined) {
  localStorage.setItem(key, JSON.stringify(String((value))));
}

/**
 * Formata um número de CPF (11 dígitos) para o formato XXX.XXX.XXX-XX.
 * Retorna uma string vazia se o CPF for inválido.
 */
export function toCpf(value: string | null | undefined): string {
  if (!value) return '';
  
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (numbers.length !== 11) return value;
  
  // Aplica a máscara XXX.XXX.XXX-XX
  return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

/**
 * Formata um número de CNPJ (14 dígitos) para o formato XX.XXX.XXX/XXXX-XX.
 * Retorna uma string vazia se o CNPJ for inválido.
 */
export function toCnpj(value: string | null | undefined): string {
  if (!value) return '';
  
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (numbers.length !== 14) return value;
  
  // Aplica a máscara XX.XXX.XXX/XXXX-XX
  return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/**
 * Formata um número de CEP (8 dígitos) para o formato XXXXX-XXX.
 * Retorna uma string vazia se o CEP for inválido.
 */
export function toCep(value: string | null | undefined): string {
  if (!value) return '';
  
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Verifica se tem 8 dígitos
  if (numbers.length !== 8) return value;
  
  // Aplica a máscara XXXXX-XXX
  return numbers.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

/**
 * Função helper para obter datetime local no formato correto para datetime-local inputs.
 * Evita problemas de timezone convertendo diretamente para o formato YYYY-MM-DDTHH:mm.
 * @param date - Data opcional. Se não fornecida, usa a data/hora atual.
 * @returns String no formato YYYY-MM-DDTHH:mm
 */
export function getLocalDateTimeString(date?: string | Date): string {
  const parsedDate = date ? normalizeDateToDayjs(date) : dayjs();

  if (!parsedDate || !parsedDate.isValid()) {
    // Fallback para agora se a data for inválida
    return dayjs().format('YYYY-MM-DDTHH:mm');
  }

  return parsedDate.format('YYYY-MM-DDTHH:mm');
}

/**
 * Retorna a data local no formato YYYY-MM-DD
 * @param date - Data opcional (string ou Date)
 * @returns String no formato YYYY-MM-DD
 */
export function getLocalDateString(date?: string | Date): string {
  const parsedDate = date ? normalizeDateToDayjs(date) : dayjs();

  if (!parsedDate || !parsedDate.isValid()) {
    // Fallback para hoje se a data for inválida
    return dayjs().format('YYYY-MM-DD');
  }

  return parsedDate.format('YYYY-MM-DD');
}
