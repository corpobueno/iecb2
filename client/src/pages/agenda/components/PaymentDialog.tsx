import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close, Add, Delete, Edit } from '@mui/icons-material';
import { IAluno, IAgenda, IPagamento } from '../../../entities/Iecb';
import { PagamentoService } from '../../../api/services/PagamentoService';
import { AlunoService } from '../../../api/services/AlunoService';
import { useSnackbar } from '../../../contexts/SnackBarProvider';
import { toCash } from '../../../utils/functions';
import { WCash } from '../../../components/contents/WCash';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  aluno: IAluno | null;
  agenda: IAgenda | null;
  onPaymentComplete?: () => void;
}

const FORMAS_PAGAMENTO = [
  { id: 1, nome: 'Débito', parcelas: false },
  { id: 2, nome: 'Dinheiro', parcelas: false },
  { id: 17, nome: 'Pix', parcelas: false },
  { id: 4, nome: 'Crédito', parcelas: true },
  { id: 11, nome: 'Pago pelo link', parcelas: true },
  { id: 3, nome: 'Cheque', parcelas: false },
  { id: 9, nome: 'Promissória', parcelas: true },
  { id: 6, nome: 'Bonificação', parcelas: false },
  { id: 16, nome: 'Crédito Cliente', parcelas: false }
];

export const PaymentDialog = ({ open, onClose, aluno, agenda, onPaymentComplete }: PaymentDialogProps) => {
  const { showSnackbarMessage } = useSnackbar();

  // Estado do aluno (valor editável)
  const [alunoValor, setAlunoValor] = useState(0);
  const [alunoValorMatricula, setAlunoValorMatricula] = useState(0);

  // Pagamentos existentes
  const [pagamentosSalvos, setPagamentosSalvos] = useState<IPagamento[]>([]);
  const [totalPago, setTotalPago] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Form do pagamento atual
  const [formaPagamento, setFormaPagamento] = useState(1);
  const [valorPagamento, setValorPagamento] = useState(0);
  const [parcelas, setParcelas] = useState(1);
  const [editingPagamento, setEditingPagamento] = useState<IPagamento | null>(null);

  // Créditos disponíveis
  const [creditos, setCreditos] = useState(0);

  const valorPendente = (alunoValor || 0) + (alunoValorMatricula || 0) - totalPago;

  const loadData = useCallback(async () => {
    if (!aluno) return;

    // Carregar pagamentos existentes do aluno
    const pagResult = await PagamentoService.findByAula(aluno.idAula);
    if (!(pagResult instanceof Error)) {
      // Filtrar apenas os pagamentos deste aluno específico
      const alunoPayments = pagResult.data.filter(p => p.idAluno === aluno.id);
      setPagamentosSalvos(alunoPayments);
      const total = alunoPayments.reduce((acc, p) => acc + (p.valor || 0), 0);
      setTotalPago(total);
    }

    // Carregar créditos do cliente
    const creditResult = await PagamentoService.getCreditosByCliente(aluno.idAluno);
    if (!(creditResult instanceof Error)) {
      setCreditos(creditResult.creditos);
    }
  }, [aluno]);

  // Auto-save valores com debounce
  useEffect(() => {
    if (!aluno || !open) return;

    // Não salvar se os valores não mudaram
    if (alunoValor === aluno.valor && alunoValorMatricula === (aluno.valorMatricula || 0)) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await AlunoService.update(aluno.id, {
          valor: alunoValor,
          valorMatricula: alunoValorMatricula,
        });
      } catch (error) {
        showSnackbarMessage('Erro ao salvar valores', 'error');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [alunoValor, alunoValorMatricula, aluno, open, showSnackbarMessage]);

  useEffect(() => {
    if (open && aluno) {
      setAlunoValor(aluno.valor || 0);
      setAlunoValorMatricula(aluno.valorMatricula || 0);
      setFormaPagamento(1);
      setParcelas(1);
      setEditingPagamento(null);
      loadData();
    }
  }, [open, aluno, loadData]);

  useEffect(() => {
    setValorPagamento(valorPendente > 0 ? valorPendente : 0);
  }, [valorPendente]);

  // Quando selecionar "Crédito Cliente", ajustar valor máximo ao crédito disponível
  useEffect(() => {
    if (formaPagamento === 16 && creditos > 0) {
      const maxValor = Math.min(valorPendente, creditos);
      if (valorPagamento > maxValor) {
        setValorPagamento(maxValor);
      }
    }
  }, [formaPagamento, creditos, valorPendente]);

  const handleAddPagamento = async () => {
    if (!aluno || !agenda) return;

    if (valorPagamento <= 0) {
      showSnackbarMessage('Valor deve ser maior que zero', 'warning');
      return;
    }

    if (valorPagamento > valorPendente) {
      showSnackbarMessage(`Valor restante: ${toCash(valorPendente)}`, 'warning');
      return;
    }

    // Validar crédito cliente (idPagamento = 16)
    if (formaPagamento === 16 && valorPagamento > creditos) {
      showSnackbarMessage(`Crédito insuficiente. Disponível: ${toCash(creditos)}`, 'error');
      return;
    }

    setIsSaving(true);
    try {
      const result = await PagamentoService.processarPagamentoAluno({
        idCliente: aluno.idAluno,
        idAula: aluno.idAula,
        idAluno: aluno.id,
        docente: agenda.docente || '',
        pagamentos: [{
          idPagamento: formaPagamento,
          valor: valorPagamento,
          qnt: parcelas,
        }],
        valorPendente: valorPendente,
      });

      if (result instanceof Error) {
        showSnackbarMessage(result.message, 'error');
        return;
      }

      // Se pagou tudo, atualizar status para pago
      const newPendente = valorPendente - valorPagamento;
      if (newPendente <= 0) {
        await AlunoService.updateStatus(aluno.id, 1);
      }

      showSnackbarMessage('Pagamento registrado');
      setParcelas(1);
      loadData();
      onPaymentComplete?.();
    } catch (error) {
      showSnackbarMessage('Erro ao processar pagamento', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePagamento = async (pagamento: IPagamento) => {
    if (!aluno || !window.confirm('Excluir este pagamento?')) return;

    try {
      const result = await PagamentoService.deleteById(pagamento.id);
      if (result instanceof Error) {
        showSnackbarMessage(result.message, 'error');
        return;
      }

      // Se após excluir ficou com valor pendente, mudar status para agendado
      const newPendente = valorPendente + (pagamento.valor || 0);
      if (newPendente > 0 && aluno.status === 1) {
        await AlunoService.updateStatus(aluno.id, 0);
      }

      showSnackbarMessage('Pagamento excluído');
      loadData();
      onPaymentComplete?.();
    } catch (error) {
      showSnackbarMessage('Erro ao excluir pagamento', 'error');
    }
  };

  const handleEditPagamento = (pagamento: IPagamento) => {
    setEditingPagamento(pagamento);
    setFormaPagamento(pagamento.idPagamento || 1);
    setValorPagamento(pagamento.valor || 0);
    setParcelas(pagamento.qnt || 1);
  };

  const handleCancelEdit = () => {
    setEditingPagamento(null);
    setFormaPagamento(1);
    setParcelas(1);
    setValorPagamento(valorPendente > 0 ? valorPendente : 0);
  };

  const handleUpdatePagamento = async () => {
    if (!editingPagamento || !aluno) return;

    if (valorPagamento <= 0) {
      showSnackbarMessage('Valor deve ser maior que zero', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await PagamentoService.update(editingPagamento.id, {
        idPagamento: formaPagamento,
        valor: valorPagamento,
        qnt: parcelas,
      });

      // Calcular novo pendente após a edição
      const valorAnterior = editingPagamento.valor || 0;
      const diferenca = valorPagamento - valorAnterior;
      const newPendente = valorPendente - diferenca;

      // Atualizar status se necessário
      if (newPendente <= 0 && aluno.status === 0) {
        await AlunoService.updateStatus(aluno.id, 1);
      } else if (newPendente > 0 && aluno.status === 1) {
        await AlunoService.updateStatus(aluno.id, 0);
      }

      showSnackbarMessage('Pagamento atualizado');
      setEditingPagamento(null);
      setParcelas(1);
      loadData();
      onPaymentComplete?.();
    } catch (error) {
      showSnackbarMessage('Erro ao atualizar pagamento', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getFormaNome = (id: number) => {
    return FORMAS_PAGAMENTO.find(f => f.id === id)?.nome || '';
  };

  const formaAtual = FORMAS_PAGAMENTO.find(f => f.id === formaPagamento);

  if (!aluno || !agenda) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">Pagamento</Typography>
          <Typography variant="body2" color="text.secondary">
            {aluno.nomeAluno}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Info do Aluno */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Curso</Typography>
            <Typography fontWeight={600}>{agenda.nomeCurso}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Docente</Typography>
            <Typography fontWeight={600}>{agenda.nomeDocente}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Tipo</Typography>
            <Typography fontWeight={600}>
              {aluno.tipo === 1 ? 'Aluna' : aluno.tipo === 2 ? 'Modelo' : '-'}
            </Typography>
          </Box>
        </Box>

        {/* Valores editáveis (auto-save) */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end' }}>
          <WCash
            label="Valor"
            name="valor"
            size="small"
            value={alunoValor}
            onChange={(e) => setAlunoValor(Number(e.target.value))}
            sx={{ width: 120 }}
          />
          {aluno.tipo === 1 && (
            <WCash
              label="Matrícula"
              name="valorMatricula"
              size="small"
              value={alunoValorMatricula}
              onChange={(e) => setAlunoValorMatricula(Number(e.target.value))}
              sx={{ width: 120 }}
            />
          )}

          {creditos > 0 && (
            <Chip
              label={`Crédito: ${toCash(creditos)}`}
              color="success"
              variant="outlined"
            />
          )}
        </Box>

        {/* Resumo financeiro */}
        <Box sx={{ display: 'flex', gap: 3, mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Total</Typography>
            <Typography fontWeight={600}>{toCash(alunoValor + alunoValorMatricula)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Pago</Typography>
            <Typography fontWeight={600} color="success.main">{toCash(totalPago)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Pendente</Typography>
            <Typography fontWeight={600} color={valorPendente > 0 ? 'error.main' : 'success.main'}>
              {toCash(valorPendente)}
            </Typography>
          </Box>
        </Box>

        {/* Pagamentos já salvos */}
        {pagamentosSalvos.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Lançamentos Registrados</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Forma</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Parcelas</TableCell>
                  <TableCell width={80}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagamentosSalvos.map((pg) => (
                  <TableRow
                    key={pg.id}
                    sx={{ bgcolor: editingPagamento?.id === pg.id ? 'action.selected' : undefined }}
                  >
                    <TableCell>{getFormaNome(pg.idPagamento || 1)}</TableCell>
                    <TableCell>{toCash(pg.valor)}</TableCell>
                    <TableCell>{(pg.qnt || 1) > 1 ? `${pg.qnt}x` : 'À Vista'}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditPagamento(pg)}
                        disabled={editingPagamento !== null}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePagamento(pg)}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Form de pagamento (adicionar ou editar) */}
        {(valorPendente > 0 || editingPagamento) && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Forma</InputLabel>
              <Select
                value={formaPagamento}
                label="Forma"
                onChange={(e) => setFormaPagamento(Number(e.target.value))}
              >
                {FORMAS_PAGAMENTO.map((f) => (
                  <MenuItem key={f.id} value={f.id}>{f.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {formaAtual?.parcelas && (
              <TextField
                label="Parcelas"
                type="number"
                size="small"
                value={parcelas}
                onChange={(e) => setParcelas(Math.min(12, Math.max(1, Number(e.target.value))))}
                inputProps={{ min: 1, max: 12 }}
                sx={{ width: 80 }}
              />
            )}

            <WCash
              label="Valor"
              name="valorPagamento"
              size="small"
              value={valorPagamento}
              onChange={(e) => setValorPagamento(Number(e.target.value))}
              sx={{ width: 120 }}
            />

            {editingPagamento ? (
              <>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Edit />}
                  onClick={handleUpdatePagamento}
                  disabled={valorPagamento <= 0 || isSaving}
                >
                  Salvar
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                size="small"
                startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Add />}
                onClick={handleAddPagamento}
                disabled={valorPagamento <= 0 || isSaving || (formaPagamento === 16 && valorPagamento > creditos)}
              >
                Adicionar
              </Button>
            )}
          </Box>
        )}

        {/* Alerta de crédito insuficiente */}
        {formaPagamento === 16 && valorPagamento > creditos && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Crédito insuficiente. Disponível: {toCash(creditos)}
          </Alert>
        )}

        {valorPendente <= 0 && !editingPagamento && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Pagamento completo!
          </Alert>
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
