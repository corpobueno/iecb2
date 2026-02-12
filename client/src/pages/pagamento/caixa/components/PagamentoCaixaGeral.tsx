import { Box, Grid, Paper, Typography } from "@mui/material";
import { ICaixaPagamentoResult } from "../../../../entities/Iecb";
import { PagamentoCaixaAccordion } from "./PagamentoCaixaAccordion";
import { toCash } from "../../../../utils/functions";
import { IPagamentoCaixaFiltros } from "./PagamentoCaixaFiltros";

interface Props {
  caixaData: ICaixaPagamentoResult;
  filtros: IPagamentoCaixaFiltros;
}

export const PagamentoCaixaGeral: React.FC<Props> = ({ caixaData, filtros }) => {
  const totalGeral = caixaData.sumPagamentos + caixaData.sumBonificacoes;
  const hasBonificacoes = caixaData.sumBonificacoes > 0;
  const mdWidth = hasBonificacoes ? 4 : 6;

  return (
    <>
      <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={mdWidth}>
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Pagamentos
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {toCash(caixaData.sumPagamentos)}
              </Typography>
            </Box>
          </Grid>

          {hasBonificacoes && (
            <Grid item xs={12} md={mdWidth}>
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Bonificações
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="secondary">
                  {toCash(caixaData.sumBonificacoes)}
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
                {toCash(totalGeral)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <PagamentoCaixaAccordion caixaData={caixaData} filtros={filtros} />
    </>
  );
};
