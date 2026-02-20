import { useEffect, useState, useMemo } from 'react';
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
  Divider,
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

  // Separar pagamentos de aulas e produtos
  const { pagamentosAulas, pagamentosProdutos } = useMemo(() => {
    const aulas = pagamentos.filter(pg => pg.idAula !== null);
    const produtos = pagamentos.filter(pg => pg.idLancamentos !== null);
    return { pagamentosAulas: aulas, pagamentosProdutos: produtos };
  }, [pagamentos]);

  // Calcular totais
  const totalAulas = useMemo(() => pagamentosAulas.reduce((sum, pg) => sum + Number(pg.valor), 0), [pagamentosAulas]);
  const totalProdutos = useMemo(() => pagamentosProdutos.reduce((sum, pg) => sum + Number(pg.valor), 0), [pagamentosProdutos]);

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
          <>
            {/* Tabela de Aulas */}
            {pagamentosAulas.length > 0 && (
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Aulas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pagamentosAulas.length} lançamentos - Total: {toCash(totalAulas)}
                  </Typography>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Curso</TableCell>
                      <TableCell>Professora</TableCell>
                      <TableCell>Caixa</TableCell>
                      <TableCell align="right">Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagamentosAulas.map((pg) => (
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
              </Box>
            )}

            {/* Divisor se tiver ambos */}
            {pagamentosAulas.length > 0 && pagamentosProdutos.length > 0 && (
              <Divider sx={{ my: 2 }} />
            )}

            {/* Tabela de Produtos */}
            {pagamentosProdutos.length > 0 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Produtos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pagamentosProdutos.length} lançamentos - Total: {toCash(totalProdutos)}
                  </Typography>
                </Box>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Produto</TableCell>
                      <TableCell>Caixa</TableCell>
                      <TableCell align="right">Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagamentosProdutos.map((pg) => (
                      <TableRow key={pg.id} hover>
                        <TableCell>{pg.id}</TableCell>
                        <TableCell>{formatDate(pg.data)}</TableCell>
                        <TableCell>{pg.nomeCliente || '-'}</TableCell>
                        <TableCell>{pg.nomeProduto || '-'}</TableCell>
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
              </Box>
            )}
          </>
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
