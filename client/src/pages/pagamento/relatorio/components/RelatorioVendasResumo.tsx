import { Box, Grid, Paper, Typography } from '@mui/material';
import { IRelatorioVendasResult } from '../../../../entities/Iecb';
import { toCash } from '../../../../utils/functions';

interface Props {
  data: IRelatorioVendasResult;
}

export const RelatorioVendasResumo: React.FC<Props> = ({ data }) => {
  const hasProdutos = data.totalProdutos > 0;
  const mdWidth = hasProdutos ? 4 : 6;

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={mdWidth}>
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Cursos
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {toCash(data.totalCursos)}
            </Typography>
          </Box>
        </Grid>

        {hasProdutos && (
          <Grid item xs={12} md={mdWidth}>
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Produtos
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="secondary">
                {toCash(data.totalProdutos)}
              </Typography>
            </Box>
          </Grid>
        )}

        <Grid item xs={12} md={mdWidth}>
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Geral
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {toCash(data.totalGeral)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
