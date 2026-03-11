import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Icon,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Checkbox
} from '@mui/material';
import { PageContainer } from '../../../components/containers/PageContainer';
import { SaveToolbar } from '../../../components/contents/SaveToolBar';
import { ColaboradorService, ChecklistAdmissaoService, AnexosRhService, TIPOS_DOCUMENTO_RH } from '../../../api/services/rh';
import type { IAnexo } from '../../../api/services/rh';
import {
  IColaborador,
  IChecklistAdmissao,
  IChecklistStats,
  STATUS_COLABORADOR_OPTIONS,
  TIPO_CONTRATO_OPTIONS,
  ColaboradorStatus
} from '../../../entities/Rh';
import { useSnackbar } from '../../../contexts/SnackBarProvider';

const getStatusColor = (status?: ColaboradorStatus) => {
  switch (status) {
    case 'ATIVO': return 'success';
    case 'FERIAS': return 'info';
    case 'AFASTADO': return 'warning';
    case 'DESLIGADO': return 'error';
    default: return 'default';
  }
};

const getStatusLabel = (status?: ColaboradorStatus) => {
  return STATUS_COLABORADOR_OPTIONS.find(s => s.value === status)?.label || status || '-';
};

const getTipoContratoLabel = (tipo?: string) => {
  return TIPO_CONTRATO_OPTIONS.find(t => t.value === tipo)?.label || tipo || '-';
};

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
};

const formatCurrency = (value?: number) => {
  if (!value) return '-';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const ColaboradorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbarMessage } = useSnackbar();

  const [colaborador, setColaborador] = useState<IColaborador | null>(null);
  const [checklist, setChecklist] = useState<IChecklistAdmissao[]>([]);
  const [checklistStats, setChecklistStats] = useState<IChecklistStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Estados para Anexos
  const [anexos, setAnexos] = useState<IAnexo[]>([]);
  const [anexosLoading, setAnexosLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState('OUTRO');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para adicionar item ao checklist
  const [novoItem, setNovoItem] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  const loadColaborador = async () => {
    const resp = await ColaboradorService.getById(Number(id));
    if (resp instanceof Error) {
      showSnackbarMessage(resp.message, 'error');
      navigate('/rh/colaboradores');
      return;
    }
    setColaborador(resp);
  };

  const loadChecklist = async () => {
    const resp = await ChecklistAdmissaoService.findByColaborador(Number(id));
    if (!(resp instanceof Error)) {
      setChecklist(resp.data);
    }

    const statsResp = await ChecklistAdmissaoService.getStats(Number(id));
    if (!(statsResp instanceof Error)) {
      setChecklistStats(statsResp);
    }
  };

  const loadAnexos = async () => {
    setAnexosLoading(true);
    try {
      const resp = await AnexosRhService.getByReferencia('rh_colaboradores_iecb', Number(id));
      if (!(resp instanceof Error)) {
        setAnexos(resp);
      }
    } finally {
      setAnexosLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    Promise.all([loadColaborador(), loadChecklist(), loadAnexos()])
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleChecklistToggle = async (item: IChecklistAdmissao) => {
    try {
      if (item.concluido === 1) {
        await ChecklistAdmissaoService.desmarcarConcluido(item.id);
      } else {
        await ChecklistAdmissaoService.marcarConcluido(item.id);
      }
      await loadChecklist();
      await loadColaborador(); // Recarrega para atualizar o score
      showSnackbarMessage('Checklist atualizado');
    } catch (error) {
      showSnackbarMessage('Erro ao atualizar checklist', 'error');
    }
  };

  const handleAddChecklistItem = async () => {
    if (!novoItem.trim()) {
      showSnackbarMessage('Digite o nome do item', 'warning');
      return;
    }

    setAddingItem(true);
    try {
      const result = await ChecklistAdmissaoService.create({
        idColaborador: Number(id),
        item: novoItem.trim(),
        concluido: 0
      });

      if (result instanceof Error) {
        showSnackbarMessage(result.message, 'error');
        return;
      }

      setNovoItem('');
      await loadChecklist();
      showSnackbarMessage('Item adicionado com sucesso');
    } catch (error) {
      showSnackbarMessage('Erro ao adicionar item', 'error');
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteChecklistItem = async (itemId: number, itemNome: string) => {
    if (!window.confirm(`Deseja excluir o item "${itemNome}"?`)) return;

    try {
      const result = await ChecklistAdmissaoService.deleteById(itemId);
      if (result instanceof Error) {
        showSnackbarMessage(result.message, 'error');
        return;
      }
      await loadChecklist();
      await loadColaborador();
      showSnackbarMessage('Item excluído com sucesso');
    } catch (error) {
      showSnackbarMessage('Erro ao excluir item', 'error');
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadLoading(true);
    try {
      const result = await AnexosRhService.uploadMultiple(
        Array.from(files),
        'rh_colaboradores_iecb',
        Number(id),
        tipoDocumento
      );

      if (result.success > 0) {
        showSnackbarMessage(`${result.success} arquivo(s) enviado(s) com sucesso`);
        await loadAnexos();
      }

      if (result.failed > 0) {
        showSnackbarMessage(`${result.failed} arquivo(s) falharam: ${result.errors.join(', ')}`, 'error');
      }
    } catch (error) {
      showSnackbarMessage('Erro ao enviar arquivos', 'error');
    } finally {
      setUploadLoading(false);
      // Limpa o input para permitir selecionar os mesmos arquivos novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAnexo = async (anexoId: number, nome: string) => {
    if (!window.confirm(`Deseja excluir o arquivo "${nome}"?`)) return;

    try {
      const result = await AnexosRhService.delete(anexoId);
      if (result instanceof Error) {
        showSnackbarMessage(result.message, 'error');
        return;
      }
      showSnackbarMessage('Arquivo excluído com sucesso');
      await loadAnexos();
    } catch (error) {
      showSnackbarMessage('Erro ao excluir arquivo', 'error');
    }
  };

  const handleOpenAnexo = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const getTipoDocumentoLabel = (tipo: string) => {
    return TIPOS_DOCUMENTO_RH.find(t => t.value === tipo)?.label || tipo;
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LinearProgress />
      </PageContainer>
    );
  }

  if (!colaborador) {
    return (
      <PageContainer>
        <Typography>Colaborador não encontrado</Typography>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      toolbar={
        <SaveToolbar
          showMenuButton
          showSaveButton={false}
          showDeleteButton={false}
          showNewButton={false}
          onClickBack={() => navigate('/rh/colaboradores')}
        >
          <IconButton
            onClick={() => navigate(`/rh/colaboradores/editar/${id}`)}
            title="Editar"
          >
            <Icon>edit</Icon>
          </IconButton>
        </SaveToolbar>
      }
    >
      <Box sx={{ px: 1 }}>
        {/* Header com informações principais */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" fontWeight={600}>
                {colaborador.nome}
              </Typography>
              <Typography color="text.secondary">
                {colaborador.cargo || 'Sem cargo'} {colaborador.setor && `• ${colaborador.setor}`}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { md: 'flex-end' }, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip
                  label={getStatusLabel(colaborador.status)}
                  color={getStatusColor(colaborador.status)}
                />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Score de Integração</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={colaborador.scoreIntegracao || 0}
                      sx={{ width: 100, height: 10, borderRadius: 5 }}
                      color={colaborador.scoreIntegracao >= 80 ? 'success' : colaborador.scoreIntegracao >= 50 ? 'warning' : 'error'}
                    />
                    <Typography fontWeight={600}>{colaborador.scoreIntegracao || 0}%</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper variant="outlined">
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Informações" />
            <Tab label={`Checklist (${checklistStats?.concluidos || 0}/${checklistStats?.total || 0})`} />
            <Tab label={`Documentos (${anexos.length})`} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 2 }}>
              <Grid container spacing={3}>
                {/* Dados Pessoais */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Dados Pessoais
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={1}>
                        <Grid item xs={6}><Typography variant="caption" color="text.secondary">CPF</Typography><Typography>{colaborador.cpf || '-'}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption" color="text.secondary">RG</Typography><Typography>{colaborador.rg || '-'}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption" color="text.secondary">Nascimento</Typography><Typography>{formatDate(colaborador.dataNascimento)}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption" color="text.secondary">Estado Civil</Typography><Typography>{colaborador.estadoCivil || '-'}</Typography></Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Contato */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Contato
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={1}>
                        <Grid item xs={6}><Typography variant="caption" color="text.secondary">Telefone</Typography><Typography>{colaborador.telefone || '-'}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption" color="text.secondary">E-mail</Typography><Typography>{colaborador.email || '-'}</Typography></Grid>
                        <Grid item xs={12}><Typography variant="caption" color="text.secondary">Endereço</Typography><Typography>{colaborador.endereco ? `${colaborador.endereco}, ${colaborador.cidade}/${colaborador.estado}` : '-'}</Typography></Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Dados Profissionais */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Dados Profissionais
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={1}>
                        <Grid item xs={6}><Typography variant="caption" color="text.secondary">Tipo Contrato</Typography><Typography>{getTipoContratoLabel(colaborador.tipoContrato)}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption" color="text.secondary">Salário</Typography><Typography>{formatCurrency(colaborador.salario)}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption" color="text.secondary">Admissão</Typography><Typography>{formatDate(colaborador.dataAdmissao)}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption" color="text.secondary">Setor</Typography><Typography>{colaborador.setor || '-'}</Typography></Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Experiência */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Período de Experiência
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={1}>
                        <Grid item xs={6}><Typography variant="caption" color="text.secondary">Início</Typography><Typography>{formatDate(colaborador.experienciaInicio)}</Typography></Grid>
                        <Grid item xs={6}><Typography variant="caption" color="text.secondary">Fim</Typography><Typography>{formatDate(colaborador.experienciaFim)}</Typography></Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">Status</Typography>
                          <Box>
                            <Chip
                              size="small"
                              label={colaborador.experienciaStatus || 'Pendente'}
                              color={colaborador.experienciaStatus === 'APROVADO' ? 'success' : colaborador.experienciaStatus === 'REPROVADO' ? 'error' : 'default'}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 2 }}>
              {checklistStats && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={checklistStats.percentualConcluido}
                    sx={{ height: 10, borderRadius: 5 }}
                    color={checklistStats.percentualConcluido >= 80 ? 'success' : checklistStats.percentualConcluido >= 50 ? 'warning' : 'error'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {checklistStats.concluidos} de {checklistStats.total} itens concluídos ({checklistStats.percentualConcluido}%)
                  </Typography>
                </Box>
              )}

              {/* Adicionar novo item */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                  bgcolor: 'action.hover'
                }}
              >
                <TextField
                  size="small"
                  label="Novo item"
                  placeholder="Ex: Entregar documento X"
                  value={novoItem}
                  onChange={(e) => setNovoItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  sx={{ flex: 1 }}
                  disabled={addingItem}
                />
                <Button
                  variant="contained"
                  startIcon={addingItem ? <CircularProgress size={20} color="inherit" /> : <Icon>add</Icon>}
                  onClick={handleAddChecklistItem}
                  disabled={addingItem || !novoItem.trim()}
                >
                  Adicionar
                </Button>
              </Paper>

              {checklist.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Nenhum item no checklist de admissão.
                  <br />
                  Adicione itens manualmente ou configure os templates para gerar automaticamente.
                </Typography>
              ) : (
                <List>
                  {checklist.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        bgcolor: item.concluido ? 'action.hover' : 'transparent',
                        borderRadius: 1,
                        mb: 0.5
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={item.concluido === 1}
                          onChange={() => handleChecklistToggle(item)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.item}
                        primaryTypographyProps={{
                          sx: { textDecoration: item.concluido ? 'line-through' : 'none' }
                        }}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {item.observacoes && <Typography variant="caption">{item.observacoes}</Typography>}
                            {item.dataConclusao && (
                              <Typography variant="caption" color="text.secondary">
                                Concluído em {formatDate(item.dataConclusao)}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleDeleteChecklistItem(item.id, item.item)}
                          title="Excluir item"
                          color="error"
                        >
                          <Icon>delete</Icon>
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 2 }}>
              {/* Área de Upload */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 3,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  alignItems: { sm: 'center' },
                  bgcolor: 'action.hover'
                }}
              >
                <TextField
                  select
                  size="small"
                  label="Tipo de Documento"
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  {TIPOS_DOCUMENTO_RH.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  variant="contained"
                  startIcon={uploadLoading ? <CircularProgress size={20} color="inherit" /> : <Icon>cloud_upload</Icon>}
                  onClick={handleFileSelect}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? 'Enviando...' : 'Selecionar Arquivos'}
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                  Formatos aceitos: PDF, JPG, PNG, DOC, DOCX (máx. 10MB cada)
                </Typography>
              </Paper>

              {/* Lista de Anexos */}
              {anexosLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : anexos.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Nenhum documento anexado.
                </Typography>
              ) : (
                <List>
                  {anexos.map((anexo) => (
                    <ListItem
                      key={anexo.id}
                      sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        mb: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemIcon>
                        <Icon color="primary">
                          {anexo.formato === 'pdf' ? 'picture_as_pdf' :
                           ['jpg', 'jpeg', 'png'].includes(anexo.formato || '') ? 'image' :
                           'description'}
                        </Icon>
                      </ListItemIcon>
                      <ListItemText
                        primary={anexo.nome}
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Chip
                              label={getTipoDocumentoLabel(anexo.tipo)}
                              size="small"
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {anexo.createdAt ? formatDate(anexo.createdAt) : ''}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleOpenAnexo(anexo.url)}
                          title="Visualizar"
                          sx={{ mr: 1 }}
                        >
                          <Icon>visibility</Icon>
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteAnexo(anexo.id, anexo.nome)}
                          title="Excluir"
                          color="error"
                        >
                          <Icon>delete</Icon>
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Total: {anexos.length} documento(s)
              </Typography>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default ColaboradorDetails;
