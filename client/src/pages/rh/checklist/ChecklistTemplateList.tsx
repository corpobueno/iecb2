import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Icon,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
  Paper,
  TextField,
  Typography,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ChecklistTemplateService } from '../../../api/services/rh';
import { PageContainer } from '../../../components/containers/PageContainer';
import { SaveToolbar } from '../../../components/contents/SaveToolBar';
import { IChecklistTemplate } from '../../../entities/Rh';
import { useSnackbar } from '../../../contexts/SnackBarProvider';

const ChecklistTemplateList = () => {
  const { showSnackbarMessage } = useSnackbar();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<IChecklistTemplate[]>([]);
  const [setores, setSetores] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [setorFilter, setSetorFilter] = useState<string>('');

  // Estados para adicionar novo template
  const [novoItem, setNovoItem] = useState('');
  const [novoSetor, setNovoSetor] = useState('');
  const [novoSetorCustom, setNovoSetorCustom] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const resp = await ChecklistTemplateService.find(setorFilter || undefined);
      if (!(resp instanceof Error)) {
        setTemplates(resp.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadSetores = async () => {
    const resp = await ChecklistTemplateService.getSetores();
    if (!(resp instanceof Error)) {
      setSetores(resp);
    }
  };

  useEffect(() => {
    loadTemplates();
    loadSetores();
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [setorFilter]);

  const handleAddTemplate = async () => {
    if (!novoItem.trim()) {
      showSnackbarMessage('Digite o nome do item', 'warning');
      return;
    }

    const setorFinal = novoSetor === 'CUSTOM' ? novoSetorCustom.trim() : novoSetor;

    setAddingItem(true);
    try {
      const result = await ChecklistTemplateService.create({
        item: novoItem.trim(),
        setor: setorFinal || undefined,
        ordem: templates.length + 1,
        obrigatorio: 1
      });

      if (result instanceof Error) {
        showSnackbarMessage(result.message, 'error');
        return;
      }

      setNovoItem('');
      setNovoSetor('');
      setNovoSetorCustom('');
      await loadTemplates();
      await loadSetores();
      showSnackbarMessage('Template adicionado com sucesso');
    } catch (error) {
      showSnackbarMessage('Erro ao adicionar template', 'error');
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteTemplate = async (id: number, item: string) => {
    if (!window.confirm(`Deseja excluir o template "${item}"?`)) return;

    try {
      const result = await ChecklistTemplateService.deleteById(id);
      if (result instanceof Error) {
        showSnackbarMessage(result.message, 'error');
        return;
      }
      await loadTemplates();
      showSnackbarMessage('Template excluído com sucesso');
    } catch (error) {
      showSnackbarMessage('Erro ao excluir template', 'error');
    }
  };

  const handleToggleObrigatorio = async (template: IChecklistTemplate) => {
    try {
      await ChecklistTemplateService.update(template.id, {
        obrigatorio: template.obrigatorio === 1 ? 0 : 1
      });
      await loadTemplates();
    } catch (error) {
      showSnackbarMessage('Erro ao atualizar template', 'error');
    }
  };

  // Agrupar templates por setor
  const templatesPorSetor = templates.reduce((acc, template) => {
    const setor = template.setor || 'Geral (todos os setores)';
    if (!acc[setor]) {
      acc[setor] = [];
    }
    acc[setor].push(template);
    return acc;
  }, {} as Record<string, IChecklistTemplate[]>);

  return (
    <PageContainer
      toolbar={
        <SaveToolbar
          showMenuButton
          showSaveButton={false}
          showDeleteButton={false}
          showNewButton={false}
          onClickBack={() => navigate('/rh/colaboradores')}
        />
      }
    >
      <Box sx={{ px: 1 }}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Templates de Checklist
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure os itens padrão que serão adicionados automaticamente ao checklist de admissão
            de novos colaboradores. Itens sem setor são aplicados a todos os colaboradores.
          </Typography>
        </Paper>

        {/* Adicionar novo template */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
          <Typography variant="subtitle2" gutterBottom>
            Adicionar novo template
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <TextField
              size="small"
              label="Item do checklist"
              placeholder="Ex: Exame admissional realizado"
              value={novoItem}
              onChange={(e) => setNovoItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTemplate()}
              sx={{ flex: 2 }}
              disabled={addingItem}
            />
            <TextField
              select
              size="small"
              label="Setor (opcional)"
              value={novoSetor}
              onChange={(e) => setNovoSetor(e.target.value)}
              sx={{ flex: 1, minWidth: 180 }}
              disabled={addingItem}
            >
              <MenuItem value="">Todos os setores</MenuItem>
              {setores.map((setor) => (
                <MenuItem key={setor} value={setor}>
                  {setor}
                </MenuItem>
              ))}
              <MenuItem value="CUSTOM">+ Novo setor...</MenuItem>
            </TextField>
            {novoSetor === 'CUSTOM' && (
              <TextField
                size="small"
                label="Nome do setor"
                value={novoSetorCustom}
                onChange={(e) => setNovoSetorCustom(e.target.value)}
                sx={{ flex: 1 }}
                disabled={addingItem}
              />
            )}
            <Button
              variant="contained"
              startIcon={addingItem ? <CircularProgress size={20} color="inherit" /> : <Icon>add</Icon>}
              onClick={handleAddTemplate}
              disabled={addingItem || !novoItem.trim()}
            >
              Adicionar
            </Button>
          </Box>
        </Paper>

        {/* Filtro por setor */}
        <Box sx={{ mb: 2 }}>
          <TextField
            select
            size="small"
            label="Filtrar por setor"
            value={setorFilter}
            onChange={(e) => setSetorFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {setores.map((setor) => (
              <MenuItem key={setor} value={setor}>
                {setor}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Lista de templates */}
        {isLoading ? (
          <LinearProgress />
        ) : templates.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Icon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}>checklist</Icon>
            <Typography color="text.secondary">
              Nenhum template cadastrado.
              <br />
              Adicione templates acima para automatizar o checklist de admissão.
            </Typography>
          </Paper>
        ) : (
          Object.entries(templatesPorSetor).map(([setor, items]) => (
            <Paper key={setor} variant="outlined" sx={{ mb: 2 }}>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {setor}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {items.length} {items.length === 1 ? 'item' : 'itens'}
                </Typography>
              </Box>
              <List dense>
                {items.map((template) => (
                  <ListItem key={template.id}>
                    <ListItemIcon>
                      <Icon color={template.obrigatorio ? 'primary' : 'disabled'}>
                        {template.obrigatorio ? 'check_circle' : 'radio_button_unchecked'}
                      </Icon>
                    </ListItemIcon>
                    <ListItemText
                      primary={template.item}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                          <Chip
                            size="small"
                            label={template.obrigatorio ? 'Obrigatório' : 'Opcional'}
                            color={template.obrigatorio ? 'primary' : 'default'}
                            variant="outlined"
                            onClick={() => handleToggleObrigatorio(template)}
                            sx={{ cursor: 'pointer' }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleDeleteTemplate(template.id, template.item)}
                        title="Excluir template"
                        color="error"
                      >
                        <Icon>delete</Icon>
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          ))
        )}

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Total: {templates.length} template(s)
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default ChecklistTemplateList;
