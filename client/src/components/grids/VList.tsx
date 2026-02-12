import { Box, BoxProps, Stack, Paper, Divider, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { scrollStyle } from '../../utils/styles';

interface VListProps extends Omit<BoxProps, 'children'> {
  children: ReactNode;
  maxHeight?: string | number;
  spacing?: number;
  showSummary?: boolean;
  summaryContent?: ReactNode;
}

/**
 * Componente de lista vertical com scroll
 * Exibe itens em cards verticais empilhados
 */
export const VList = ({
  children,
  maxHeight = '320px',
  spacing = 0.75,
  showSummary = false,
  summaryContent,
  ...boxProps
}: VListProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: `calc( 100vh - ${maxHeight})`,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        ...scrollStyle,
        ...boxProps.sx,
      }}
      {...boxProps}
    >
      <Stack spacing={spacing} sx={{ flex: 1 }}>
        {children}

        {/* Card de resumo/totais */}
        {showSummary && summaryContent && (
          <>
            <Divider sx={{ my: 1 }} />
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: 'action.hover',
                borderColor: 'primary.main',
                borderWidth: 2,
              }}
            >
              {summaryContent}
            </Paper>
          </>
        )}
      </Stack>
    </Box>
  );
};

interface VListSummaryProps {
  title?: string;
  children: ReactNode;
}

/**
 * Componente de resumo/totais para o VList
 */
export const VListSummary = ({ title = 'Resumo', children }: VListSummaryProps) => {
  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      {children}
    </>
  );
};

interface VListSummaryItemProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

/**
 * Item individual do resumo
 */
export const VListSummaryItem = ({ label, value, highlight = false }: VListSummaryItemProps) => {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant={highlight ? 'h6' : 'body1'}
        color={highlight ? 'primary' : 'text.primary'}
        sx={{ fontWeight: highlight ? 700 : 600 }}
      >
        {value}
      </Typography>
    </Box>
  );
};

interface VListEmptyProps {
  message?: string;
}

/**
 * Estado vazio da lista
 */
export const VListEmpty = ({ message = 'Nenhum item encontrado' }: VListEmptyProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
        color: 'text.secondary',
      }}
    >
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
};
