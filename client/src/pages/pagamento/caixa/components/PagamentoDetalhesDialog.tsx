import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { PagamentoService } from '../../../../api/services/PagamentoService';
import { IPagamentoDetalhe, IFormaPagamentoAgrupado } from '../../../../entities/Iecb';
import { toCash, formatDate } from '../../../../utils/functions';
import { IPagamentoCaixaFiltros } from './PagamentoCaixaFiltros';

interface PagamentoDetalhesDialogProps {
  open: boolean;
  onClose: () => void;
  forma: IFormaPagamentoAgrupado | null;
  filtros: IPagamentoCaixaFiltros;
}

export const PagamentoDetalhesDialog = ({ open, onClose, forma, filtros }: PagamentoDetalhesDialogProps) => {
  const [pagamentos, setPagamentos] = useState<IPagamentoDetalhe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && forma) {
      loadData();
    }
  }, [open, forma]);

  const loadData = async () => {
    if (!forma) return;

    setIsLoading(true);
    try {
      const result = await PagamentoService.getCaixaDetalhes({
        ...filtros,
        idPagamento: forma.idPagamento,
      });

      if (!(result instanceof Error)) {
        setPagamentos(result);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!forma) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">{forma.nome}</Typography>
          <Typography variant="body2" color="text.secondary">
            {forma.count} lançamentos - Total: {toCash(forma.total)}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : pagamentos.length === 0 ? (
          <Box display="flex" justifyContent="center" p={4}>
            <Typography color="text.secondary">Nenhum registro encontrado</Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                 <TableCell></TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Curso</TableCell>
                <TableCell>Professora</TableCell>
                <TableCell>Caixa</TableCell>
                <TableCell align="right">Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagamentos.map((pg) => (
                <TableRow key={pg.id} hover>
                     <TableCell>{pg.id}</TableCell>
                  <TableCell>{formatDate(pg.data)}</TableCell>
                  <TableCell>{pg.nomeCliente || '-'}</TableCell>
                  <TableCell>{pg.nomeCurso || '-'}</TableCell>
                  <TableCell>{pg.docente || '-'}</TableCell>
                  <TableCell>{pg.caixa || '-'}</TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={500} color="primary">
                      {toCash(pg.valor)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
