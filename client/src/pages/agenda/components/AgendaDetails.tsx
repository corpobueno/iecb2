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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Delete,
  Search,
  PersonAdd,
  AccessTime,
  CheckCircle,
  Payment,
  Edit,
  Replay,
  Cancel,
  Add,
} from '@mui/icons-material';
import { IAgenda, IAluno, IAcompanhamento, ILeads, ICurso, IDocente } from '../../../entities/Iecb';
import { AlunoService } from '../../../api/services/AlunoService';
import { AcompanhamentoService } from '../../../api/services/AcompanhamentoService';
import { LeadsService } from '../../../api/services/LeadsService';
import { AgendaService } from '../../../api/services/AgendaService';
import { AulaService } from '../../../api/services/AulaService';
import { CursoService } from '../../../api/services/CursoService';
import { DocenteService } from '../../../api/services/DocenteService';
import { WCash } from '../../../components/contents/WCash';
import { useSnackbar } from '../../../contexts/SnackBarProvider';
import { useAuth } from '../../../contexts/AuthContext';
import { toCash, toTel } from '../../../utils/functions';
import { PaymentDialog } from './PaymentDialog';
import { SaveToolbar } from '../../../components/contents/SaveToolBar';
import { PageContainer } from '../../../components/containers/PageContainer';
import { ConfirmCancelDialog } from '../../../components/dialogs/ConfirmCancelDialog';

interface AgendaDetailsProps {
  open: boolean;
  onClose: () => void;
  agenda: IAgenda | null;
  onRefresh?: () => void;
}

// Status: 0 = Agendado, 1 = Pago
// Tipo: 1 = Aluna (A), 2 = Modelo (M)

export const AgendaDetails = ({ open, onClose, agenda, onRefresh }: AgendaDetailsProps) => {
  const { showSnackbarMessage } = useSnackbar();
  const { user } = useAuth();
  const [alunos, setAlunos] = useState<IAluno[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<(IAcompanhamento | ILeads & { isLead?: boolean })[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<IAcompanhamento | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<number>(1);
  const [sumValor, setSumValor] = useState(0);
  const [selectedAlunoForPayment, setSelectedAlunoForPayment] = useState<IAluno | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [showSearchClient, setShowSearchClient] = useState(false)

  // Edit mode state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [docentes, setDocentes] = useState<IDocente[]>([]);
  const [editForm, setEditForm] = useState({
    data: '',
    hora: '',
    horaFim: '',
    idCurso: 0,
    docente: '',
    valor: 0,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Replicate state
  const [showReplicateDialog, setShowReplicateDialog] = useState(false);
  const [replicateData, setReplicateData] = useState('');
  const [isReplicating, setIsReplicating] = useState(false);

  // Cancel state
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const loadAlunos = useCallback(async () => {
    if (!agenda) return;
    setShowSearchClient(false)
    setIsLoading(true);
    try {
      const result = await AlunoService.findByAulaAndData(agenda.idAula, agenda.data);
      if (!(result instanceof Error)) {
        setAlunos(result.data);
      }

      const sumResult = await AlunoService.sumValorByAula(agenda.idAula);
      if (!(sumResult instanceof Error)) {
        setSumValor(sumResult);
      }
    } catch (error) {
      showSnackbarMessage('Erro ao carregar alunos', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [agenda, showSnackbarMessage]);

  useEffect(() => {
    if (open && agenda) {
      loadAlunos();
      setSearchText('');
      setSearchResults([]);
    }
  }, [open, agenda, loadAlunos]);

  const handleSearch = useCallback(async () => {
    if (searchText.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search in acompanhamento (clients)
      const clientResult = await AcompanhamentoService.find(1, searchText);

      // Search in leads
      const leadsResult = await LeadsService.find(1, searchText);

      const results: any[] = [];

      if (!(clientResult instanceof Error)) {
        results.push(...clientResult.data.map(c => ({ ...c, isLead: false })));
      }

      if (!(leadsResult instanceof Error)) {
        results.push(...leadsResult.data.map(l => ({ ...l, isLead: true })));
      }

      // Filter out already added students
      const alunoIds = alunos.map(a => a.idAluno);
      const filteredResults = results.filter(r => !alunoIds.includes(r.id));

      setSearchResults(filteredResults);
    } catch (error) {
      showSnackbarMessage('Erro ao pesquisar', 'error');
    } finally {
      setIsSearching(false);
    }
  }, [searchText, alunos, showSnackbarMessage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.length >= 2) {
        handleSearch();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, handleSearch]);

  const handleAddClient = (client: IAcompanhamento) => {
    setSelectedClient(client);
    setSelectedTipo(1);
    setShowAddDialog(true);
  };

  const handleConfirmAdd = async () => {
    if (!agenda || !selectedClient) return;

    try {
      await AlunoService.create({
        idAluno: selectedClient.id,
        idAula: agenda.idAula,
        data: agenda.data,
        tipo: selectedTipo,
        status: 0,
        valor: agenda.valor || 0,
      });
      showSnackbarMessage('Aluno adicionado com sucesso');
      setShowAddDialog(false);
      setSelectedClient(null);
      setSearchText('');
      setSearchResults([]);
      loadAlunos();
      onRefresh?.();
    } catch (error) {
      showSnackbarMessage('Erro ao adicionar aluno', 'error');
    }
  };

  const handleRemoveAluno = async (aluno: IAluno) => {
    if (!window.confirm(`Remover ${aluno.nomeAluno} desta aula?`)) return;

    try {
      await AlunoService.deleteById(aluno.id);
      showSnackbarMessage('Aluno removido');
      loadAlunos();
      onRefresh?.();
    } catch (error) {
      showSnackbarMessage('Erro ao remover aluno', 'error');
    }
  };

  const handleToggleStatus = async (aluno: IAluno) => {
    const newStatus = aluno.status === 0 ? 1 : 0;
    try {
      await AlunoService.updateStatus(aluno.id, newStatus);
      loadAlunos();
    } catch (error) {
      showSnackbarMessage('Erro ao atualizar status', 'error');
    }
  };

  const getTipoLabel = (tipo?: number) => {
    switch (tipo) {
      case 1: return <Tooltip title="Aluna"><Chip size="small" label="A" sx={{ bgcolor: '#d3912e', color: 'white', fontWeight: 600 }} /></Tooltip>;
      case 2: return <Tooltip title="Modelo"><Chip size="small" label="M" sx={{ bgcolor: '#701d97', color: 'white', fontWeight: 600 }} /></Tooltip>;
      default: return null;
    }
  };

  const getStatusIcon = (status?: number) => {
    return status === 1
      ? <Tooltip title="Pago"><CheckCircle sx={{ color: '#1c992d' }} /></Tooltip>
      : <Tooltip title="Agendado"><AccessTime sx={{ color: '#888' }} /></Tooltip>;
  };

  const handleOpenPayment = (aluno: IAluno) => {
    setSelectedAlunoForPayment(aluno);
    setPaymentDialogOpen(true);
  };

  const handleClosePayment = () => {
    setPaymentDialogOpen(false);
    setSelectedAlunoForPayment(null);
  };

  const handlePaymentComplete = () => {
    loadAlunos();
    onRefresh?.();
  };

  const handleOpenEdit = async () => {
    if (!agenda) return;

    // Carregar cursos e docentes
    const [cursosResult, docentesResult, aulaResult] = await Promise.all([
      CursoService.find(),
      DocenteService.find(),
      AulaService.getById(agenda.idAula),
    ]);

    if (!(cursosResult instanceof Error)) {
      setCursos(cursosResult.data);
    }
    if (!(docentesResult instanceof Error)) {
      setDocentes(docentesResult.data);
    }

    // Preencher form com dados atuais
    setEditForm({
      data: agenda.data,
      hora: agenda.hora?.substring(0, 5) || '',
      horaFim: agenda.horaFim?.substring(0, 5) || '',
      idCurso: aulaResult.idCurso || 0,
      docente: aulaResult.docente || '',
      valor: aulaResult.valor || 0,
    });

    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!agenda) return;

    setIsSavingEdit(true);
    try {
      // Atualizar agenda (data, hora, horaFim)
      await AgendaService.update(agenda.id, {
        data: editForm.data,
        hora: editForm.hora,
        horaFim: editForm.horaFim,
      });

      // Atualizar aula (curso, docente, valor)
      await AulaService.update(agenda.idAula, {
        idCurso: editForm.idCurso,
        docente: editForm.docente,
        valor: editForm.valor,
      });

      showSnackbarMessage('Agenda atualizada');
      setShowEditDialog(false);
      onRefresh?.();
      onClose();
    } catch (error) {
      showSnackbarMessage('Erro ao atualizar agenda', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleOpenReplicate = () => {
    if (!agenda) return;
    setReplicateData(agenda.data);
    setShowReplicateDialog(true);
  };

  const handleConfirmReplicate = async () => {
    if (!agenda || !replicateData) return;

    setIsReplicating(true);
    try {
      await AgendaService.create({
        idAula: agenda.idAula,
        data: replicateData,
        hora: agenda.hora,
        horaFim: agenda.horaFim,
        nota: agenda.nota,
        usuario: user?.login || '',
      });

      showSnackbarMessage('Agendamento replicado com sucesso');
      setShowReplicateDialog(false);
      onRefresh?.();
    } catch (error) {
      showSnackbarMessage('Erro ao replicar agendamento', 'error');
    } finally {
      setIsReplicating(false);
    }
  };

  const handleCancel = async () => {
    if (!agenda) return;
    const count = await AgendaService.countByAula(agenda.idAula);

    // Se houver apenas 1 (este que estamos excluindo), desativar a aula também
    if (count <= 1) {
      setShowCancelDialog(true);
    } else {
      await AgendaService.deleteById(agenda.id);
      showSnackbarMessage('Agendamento cancelado');
      onRefresh?.();
      onClose();
    }

  };

  const handleConfirmCancel = async () => {
    if (!agenda) return;

    setIsCanceling(true);
    try {
      await AulaService.cancel(agenda.idAula);
      showSnackbarMessage('Agendamento cancelado e aula desativada');
      onRefresh?.();
      onClose();
    } catch (error) {
      showSnackbarMessage('Erro ao cancelar agendamento', 'error');
    } finally {
      setIsCanceling(false);
    }
  };

  if (!agenda) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <PageContainer
          toolbar={
            <SaveToolbar
              showSaveButton={false}
              onClickBack={onClose}
            >
              <Tooltip title="Replicar">
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={handleOpenReplicate}
                  startIcon={<Replay />}
                  disabled={isReplicating}
                >
                  Replicar
                </Button>
              </Tooltip>
              <Tooltip title="Cancelar agendamento">
                <Button
                  color="error"
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<Cancel />}
                  disabled={isCanceling}
                >
                  {isCanceling ? <CircularProgress size={20} /> : 'Cancelar'}
                </Button>
              </Tooltip>
            </SaveToolbar>}
        >

          <Paper
            component={DialogTitle}
            variant='outlined'
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              p: 2,
              m: 1
            }}
          >

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body1">#{agenda.id}  {agenda.nomeCurso || 'Aula'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {agenda.nomeDocente}
                </Typography>
              </Box>
              <Tooltip title="Editar">
                <IconButton onClick={handleOpenEdit} size="small">
                  <Edit />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Agenda Info */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Data</Typography>
                <Typography fontWeight={600}>
                  {agenda.data.split('-').reverse().join('/')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Horário</Typography>
                <Typography fontWeight={600}>
                  {agenda.hora?.substring(0, 5)} - {agenda.horaFim?.substring(0, 5)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Valor</Typography>
                <Typography fontWeight={600}>
                  {toCash(agenda.valor || 0)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Total</Typography>
                <Typography fontWeight={600}>
                  {toCash(sumValor)}
                </Typography>
              </Box>
            </Box>

          </Paper>

          <Paper component={DialogContent} variant='outlined' sx={{ p: 2, m: 1 }} >

            {/* Search */}
            {!!showSearchClient &&
              <>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Pesquisar cliente ou lead..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    endAdornment: isSearching ? (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    ) : null,
                  }}
                  sx={{ my: 2 }}
                />

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <Box sx={{ mb: 2, maxHeight: 150, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1 }}>
                    <List dense>
                      {searchResults.map((item: any) => (
                        <ListItem
                          key={`${item.isLead ? 'lead' : 'client'}-${item.id}`}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                            color: item.isLead ? '#4864e2' : 'inherit'
                          }}
                          onClick={() => item.isLead
                            ? showSnackbarMessage('Cadastre o lead como cliente primeiro', 'warning')
                            : handleAddClient(item)
                          }
                        >
                          <ListItemText
                            primary={item.nome}
                            secondary={item.telefone ? toTel(item.telefone) : '-'}
                          />
                          <ListItemSecondaryAction>
                            {item.isLead ? (
                              <Chip size="small" label="Lead" color="primary" variant="outlined" />
                            ) : (
                              <IconButton size="small" onClick={() => handleAddClient(item)}>
                                <PersonAdd />
                              </IconButton>
                            )}
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />
              </>
            }
            {/* Enrolled Students */}
            <Box display='flex' justifyContent='space-between' mt={1}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Agendados ({alunos.length})
              </Typography>
              {!showSearchClient &&
                <Button
                  variant='contained'
                  disableElevation
                  color='success'
                  size='small'
                  startIcon={<Add />}

                  onClick={() => setShowSearchClient(true)}
                >
                  Adicionar
                </Button>}
            </Box>


            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {alunos.map((aluno) => (
                  <ListItem key={aluno.id} divider>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <IconButton size="small" onClick={() => handleToggleStatus(aluno)}>
                        {getStatusIcon(aluno.status)}
                      </IconButton>
                      {getTipoLabel(aluno.tipo)}
                      <ListItemText
                        primary={aluno.nomeAluno}
                        secondary={aluno.telefone ? toTel(aluno.telefone) : undefined}
                      />
                    </Box>
                    <ListItemSecondaryAction>
                      <Tooltip title="Pagamento">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenPayment(aluno)}
                          sx={{ color: 'primary.main', mr: 1 }}
                        >
                          <Payment />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveAluno(aluno)}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {alunos.length === 0 && (
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Nenhum aluno agendado
                  </Typography>
                )}
              </List>
            )}
          </Paper>
        </PageContainer>
      </Dialog >

      {/* Add Student Dialog */}
      < Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)}>
        <DialogTitle>Adicionar Aluno</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Selecione a categoria para <strong>{selectedClient?.nome}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={selectedTipo}
              label="Tipo"
              onChange={(e) => setSelectedTipo(Number(e.target.value))}
            >
              <MenuItem value={1}>Aluna</MenuItem>
              <MenuItem value={2}>Modelo</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancelar</Button>
          <Button onClick={handleConfirmAdd} variant="contained">
            Agendar
          </Button>
        </DialogActions>

      </Dialog >

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={handleClosePayment}
        aluno={selectedAlunoForPayment}
        agenda={agenda}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Agenda</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Data"
              type="date"
              size="small"
              value={editForm.data}
              onChange={(e) => setEditForm({ ...editForm, data: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Hora Início"
                type="time"
                size="small"
                value={editForm.hora}
                onChange={(e) => setEditForm({ ...editForm, hora: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Hora Fim"
                type="time"
                size="small"
                value={editForm.horaFim}
                onChange={(e) => setEditForm({ ...editForm, horaFim: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            <FormControl fullWidth size="small">
              <InputLabel>Curso</InputLabel>
              <Select
                value={editForm.idCurso}
                label="Curso"
                onChange={(e) => setEditForm({ ...editForm, idCurso: Number(e.target.value) })}
              >
                {cursos.map((curso) => (
                  <MenuItem key={curso.id} value={curso.id}>{curso.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Professora</InputLabel>
              <Select
                value={editForm.docente}
                label="Professora"
                onChange={(e) => setEditForm({ ...editForm, docente: e.target.value })}
              >
                {docentes.map((docente) => (
                  <MenuItem key={docente.login} value={docente.login}>{docente.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <WCash
              label="Valor"
              name="valor"
              size="small"
              value={editForm.valor}
              onChange={(e) => setEditForm({ ...editForm, valor: Number(e.target.value) })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)} disabled={isSavingEdit}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={isSavingEdit}
          >
            {isSavingEdit ? <CircularProgress size={20} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Replicate Dialog */}
      <Dialog open={showReplicateDialog} onClose={() => setShowReplicateDialog(false)}>
        <DialogTitle>Replicar Agendamento</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Selecione a data para o novo agendamento
          </Typography>
          <TextField
            label="Data"
            type="date"
            size="small"
            fullWidth
            value={replicateData}
            onChange={(e) => setReplicateData(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReplicateDialog(false)} disabled={isReplicating}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmReplicate}
            variant="contained"
            disabled={isReplicating || !replicateData}
          >
            {isReplicating ? <CircularProgress size={20} /> : 'Replicar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Cancel Dialog */}
      <ConfirmCancelDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleConfirmCancel}
        title="Cancelar Aula"
        message="Tem certeza que deseja cancelar esta aula? Todos os pagamentos vinculados à elas serão convertidos em crédito para as alunas."
      />
    </>
  );
};
