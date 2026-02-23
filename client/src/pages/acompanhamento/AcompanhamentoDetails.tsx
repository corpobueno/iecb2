import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Divider,
  Button,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Edit,
  ExpandMore,
  School,
  Payment,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { PageContainer } from '../../components/containers/PageContainer';
import { BaseToolbar } from '../../components/contents/BaseToolbar';
import { AcompanhamentoService } from '../../api/services/AcompanhamentoService';
import { AlunoService } from '../../api/services/AlunoService';
import { PagamentoService } from '../../api/services/PagamentoService';
import { IAcompanhamento, IAluno, IPagamento } from '../../entities/Iecb';
import { useSnackbar } from '../../contexts/SnackBarProvider';
import { toCash, toTel, formatDate } from '../../utils/functions';

const AcompanhamentoDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbarMessage } = useSnackbar();

  const [cliente, setCliente] = useState<IAcompanhamento | null>(null);
  const [aulas, setAulas] = useState<IAluno[]>([]);
  const [pagamentos, setPagamentos] = useState<IPagamento[]>([]);
  const [creditos, setCreditos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      // Carregar dados do cliente
      const clienteResult = await AcompanhamentoService.getById(Number(id));
      if (clienteResult instanceof Error) {
        showSnackbarMessage('Cliente não encontrado', 'error');
        navigate('/acompanhamento');
        return;
      }
      setCliente(clienteResult);

      // Carregar histórico de aulas
      const aulasResult = await AlunoService.findByCliente(Number(id));
      if (!(aulasResult instanceof Error)) {
        setAulas(aulasResult.data);
      }

      // Carregar pagamentos
      const pagamentosResult = await PagamentoService.findByCliente(Number(id));
      if (!(pagamentosResult instanceof Error)) {
        setPagamentos(pagamentosResult.data);
      }

      // Carregar créditos
      const creditosResult = await PagamentoService.getCreditosByCliente(Number(id));
      if (!(creditosResult instanceof Error)) {
        setCreditos(creditosResult.creditos);
      }
    } catch (error) {
      showSnackbarMessage('Erro ao carregar dados', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, showSnackbarMessage, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getTipoLabel = (tipo?: number) => {
    switch (tipo) {
      case 1: return <Chip size="small" label="Aluna" sx={{ bgcolor: '#d3912e', color: 'white' }} />;
      case 2: return <Chip size="small" label="Modelo" sx={{ bgcolor: '#701d97', color: 'white' }} />;
      default: return null;
    }
  };

  const getStatusLabel = (status?: number) => {
    return status === 1
      ? <Chip size="small" label="Pago" color="success" />
      : <Chip size="small" label="Pendente" color="warning" />;
  };

  // Separar pagamentos vinculados a aulas dos créditos (sem idAula)
  const pagamentosAulas = pagamentos.filter(p => p.idAula);
  const pagamentosCredito = pagamentos.filter(p => !p.idAula);

  if (isLoading) {
    return (
      <PageContainer toolbar={<BaseToolbar onClickBack={() => navigate('/acompanhamento')} />}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (!cliente) {
    return null;
  }

  return (
    <PageContainer
      toolbar={
        <BaseToolbar onClickBack={() => navigate('/acompanhamento')}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Edit />}
            onClick={() => navigate(`/acompanhamento/editar/${id}`)}
          >
            Editar
          </Button>
        </BaseToolbar>
      }
    >
      {/* Dados do Cliente */}
      <Paper variant="outlined" sx={{ p: 2, m: 1 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {cliente.nome}
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Telefone</Typography>
            <Typography>{toTel(cliente.telefone)}</Typography>
          </Box>
          {cliente.email && (
            <Box>
              <Typography variant="caption" color="text.secondary">Email</Typography>
              <Typography>{cliente.email}</Typography>
            </Box>
          )}
          {cliente.interesse && (
            <Box>
              <Typography variant="caption" color="text.secondary">Interesse</Typography>
              <Typography>{cliente.interesse}</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">Cadastro</Typography>
            <Typography>{formatDate(cliente.dataCadastro)}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Créditos */}
      {creditos > 0 && (
        <Paper variant="outlined" sx={{ p: 2, m: 1, bgcolor: '#e8f5e9' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceWallet color="success" />
            <Typography variant="subtitle1" fontWeight={600} color="success.main">
              Crédito disponível: {toCash(creditos)}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Histórico de Aulas */}
      <Accordion defaultExpanded sx={{ m: 1 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Histórico de Aulas ({aulas.length})
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          {aulas.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              Nenhuma aula encontrada
            </Typography>
          ) : (
            <List dense>
              {aulas.map((aula) => (
                <ListItem key={aula.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={500}>{aula.nomeCurso || 'Curso'}</Typography>
                        {getTipoLabel(aula.tipo)}
                        {getStatusLabel(aula.status)}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {aula.data?.split('-').reverse().join('/')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {aula.nomeDocente}
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {toCash(aula.valor || 0)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Pagamentos */}
      <Accordion defaultExpanded sx={{ m: 1 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Payment color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Pagamentos ({pagamentos.length})
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          {pagamentos.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              Nenhum pagamento encontrado
            </Typography>
          ) : (
            <>
              {/* Pagamentos de Aulas */}
              {pagamentosAulas.length > 0 && (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ px: 2, pt: 1, display: 'block' }}>
                    Pagamentos de Aulas
                  </Typography>
                  <List dense>
                    {pagamentosAulas.map((pag) => (
                      <ListItem key={pag.id} divider>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography fontWeight={500}>{pag.nomeCurso || 'Aula'}</Typography>
                              <Chip size="small" label={pag.caixa} variant="outlined" />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(pag.data)}
                              </Typography>
                              <Typography variant="body2" fontWeight={500} color="success.main">
                                {toCash(pag.valor)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {/* Créditos (pagamentos sem aula) */}
              {pagamentosCredito.length > 0 && (
                <>
                  <Divider />
                  <Typography variant="caption" color="text.secondary" sx={{ px: 2, pt: 1, display: 'block' }}>
                    Créditos (sem aula vinculada)
                  </Typography>
                  <List dense>
                    {pagamentosCredito.map((pag) => (
                      <ListItem key={pag.id} divider>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography fontWeight={500}>Crédito</Typography>
                              <Chip size="small" label={pag.caixa} variant="outlined" />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(pag.data)}
                              </Typography>
                              <Typography variant="body2" fontWeight={500} color="info.main">
                                {toCash(pag.valor)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </PageContainer>
  );
};

export default AcompanhamentoDetails;
