import { SxProps, Theme } from '@mui/material';

/**
 * Gera estilos para altura responsiva considerando Safe Area Insets
 * Útil para containers scrolláveis que precisam respeitar barras de navegação mobile
 *
 * @param offset - Valor a ser subtraído da altura da viewport (ex: "130px", "200px")
 * @param options - Opções adicionais de configuração
 * @returns Objeto de estilos MUI SxProps
 *
 * @example
 * // Uso básico
 * <Grid sx={getSafeAreaStyles('130px')} />
 *
 * @example
 * // Com opções customizadas
 * <Grid sx={getSafeAreaStyles('130px', {
 *   includeOverflow: false,
 *   includePaddingBottom: false
 * })} />
 */
export const getSafeAreaStyles = (
  offset: string = '0px',
  options: {
    includeOverflow?: boolean;
    includePaddingBottom?: boolean;
    useMinHeight?: boolean;
  } = {}
): SxProps<Theme> => {
  const {
    includeOverflow = true,
    includePaddingBottom = true,
    useMinHeight = false,
  } = options;

  const heightProperty = useMinHeight ? 'minHeight' : 'maxHeight';

  return {
    [heightProperty]: `calc(100dvh - ${offset} - env(safe-area-inset-bottom))`,
    // Fallback para navegadores que não suportam dvh
    '@supports not (height: 100dvh)': {
      [heightProperty]: `calc(100vh - ${offset} - env(safe-area-inset-bottom))`,
    },
    ...(includeOverflow && { overflow: 'auto' }),
    ...(includePaddingBottom && { paddingBottom: 'env(safe-area-inset-bottom)' }),
  };
};

/**
 * Gera apenas o padding bottom com Safe Area Inset
 * Útil para elementos fixos no bottom da tela
 *
 * @param extraPadding - Padding adicional além do safe area (padrão: '0px')
 * @returns Objeto de estilos MUI SxProps
 *
 * @example
 * <Button sx={getSafeAreaPaddingBottom('16px')}>Salvar</Button>
 */
export const getSafeAreaPaddingBottom = (extraPadding: string = '0px'): SxProps<Theme> => ({
  paddingBottom: extraPadding === '0px'
    ? 'env(safe-area-inset-bottom)'
    : `calc(env(safe-area-inset-bottom) + ${extraPadding})`,
});

/**
 * Gera estilos para altura total (100vh) considerando Safe Area
 * Útil para páginas full-screen
 *
 * @returns Objeto de estilos MUI SxProps
 *
 * @example
 * <Box sx={getFullHeightSafeArea()}>Conteúdo Full Screen</Box>
 */
export const getFullHeightSafeArea = (): SxProps<Theme> => ({
  height: '100dvh',
  '@supports not (height: 100dvh)': {
    height: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
  },
});

/**
 * Retorna apenas a string de altura com Safe Area
 * Útil quando você precisa apenas do valor de altura sem outros estilos
 *
 * @returns String com a altura calculada
 *
 * @example
 * <Box sx={{ height: getFullHeightSafeAreaValue(), display: 'flex' }}>Conteúdo</Box>
 */
export const getFullHeightSafeAreaValue = (): string => '100dvh';

export const scrollStyle = {
    '&::-webkit-scrollbar': {
        width: '6px', // Define a barra de rolagem fina
        height: '8px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#bbb',
        borderRadius: '10px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: '#eee', // Muda a cor ao passar o mouse
      },
      '&:hover': {
        '&::-webkit-scrollbar': {
          width: '6px', // Expande a barra ao passar o mouse
        },
      },
}