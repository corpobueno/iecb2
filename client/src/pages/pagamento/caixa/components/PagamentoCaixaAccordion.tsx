import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Typography, Card, CardContent, CardActionArea } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaymentsIcon from '@mui/icons-material/Payments';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { useState } from "react";
import { toCash } from "../../../../utils/functions";
import { ICaixaPagamentoResult, IFormaPagamentoAgrupado } from "../../../../entities/Iecb";
import { PagamentoDetalhesDialog } from "./PagamentoDetalhesDialog";
import { IPagamentoCaixaFiltros } from "./PagamentoCaixaFiltros";

interface Props {
  caixaData: ICaixaPagamentoResult;
  filtros: IPagamentoCaixaFiltros;
}

interface PagamentoCardProps {
  forma: IFormaPagamentoAgrupado;
  onClick: (forma: IFormaPagamentoAgrupado) => void;
}

const PagamentoCard: React.FC<PagamentoCardProps> = ({ forma, onClick }) => {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardActionArea onClick={() => onClick(forma)} sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {forma.nome}
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {toCash(forma.total)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {forma.count} {forma.count === 1 ? 'lançamento' : 'lançamentos'}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
};

export const PagamentoCaixaAccordion: React.FC<Props> = ({ caixaData, filtros }) => {
  const [expanded, setExpanded] = useState<string | false>('pagamentos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedForma, setSelectedForma] = useState<IFormaPagamentoAgrupado | null>(null);

  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleCardClick = (forma: IFormaPagamentoAgrupado) => {
    setSelectedForma(forma);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedForma(null);
  };

  return (
    <>
      {/* Seção de Pagamentos */}
      <Accordion
        expanded={expanded === 'pagamentos'}
        onChange={handleAccordionChange('pagamentos')}
        elevation={0}
        variant="outlined"
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <PaymentsIcon color="primary" />
            <Typography variant="subtitle1" fontWeight="bold">
              Pagamentos
            </Typography>
          </Box>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            {toCash(caixaData.sumPagamentos)}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {caixaData.pagamentos.map((forma) =>
              <PagamentoCard key={forma.idPagamento} forma={forma} onClick={handleCardClick} />
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Seção de Bonificações */}
      {caixaData.bonificacoes.length > 0 && (
        <Accordion
          expanded={expanded === 'bonificacoes'}
          onChange={handleAccordionChange('bonificacoes')}
          elevation={0}
          variant="outlined"
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1} flex={1}>
              <CardGiftcardIcon color="secondary" />
              <Typography variant="subtitle1" fontWeight="bold">
                Bonificações
              </Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" color="secondary">
              {toCash(caixaData.sumBonificacoes)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {caixaData.bonificacoes.map((forma) =>
                <PagamentoCard key={forma.idPagamento} forma={forma} onClick={handleCardClick} />
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Dialog de Detalhes */}
      <PagamentoDetalhesDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        forma={selectedForma}
        filtros={filtros}
      />
    </>
  );
};
