import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Icon,
  IconButton,
  MenuItem,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ColaboradorService } from '../../../api/services/rh';
import { VTable, VTableFooter } from '../../../components/grids/VTable';
import { PageContainer } from '../../../components/containers/PageContainer';
import { SearchToolbar } from '../../../components/contents/SearchToolbar';
import { IColaborador, ColaboradorStatus, STATUS_COLABORADOR_OPTIONS } from '../../../entities/Rh';
import { useSnackbar } from '../../../contexts/SnackBarProvider';
import { useDebounce } from '../../../hooks/UseDebounce';

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

const ColaboradorList = () => {
  const { showSnackbarMessage } = useSnackbar();
  const navigate = useNavigate();
  const { debounce } = useDebounce(500);

  const [rows, setRows] = useState<IColaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ColaboradorStatus | ''>('');

  const loadData = (searchTerm?: string, status?: ColaboradorStatus | '') => {
    setIsLoading(true);
    ColaboradorService.find({
      search: searchTerm,
      status: status || undefined,
      ativo: 1
    })
      .then((resp) => {
        setIsLoading(false);
        if (resp instanceof Error) {
          showSnackbarMessage(resp.message, 'error');
        } else {
          setRows(resp.data);
        }
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    debounce(() => {
      loadData(value, statusFilter);
    });
  };

  const handleStatusChange = (value: ColaboradorStatus | '') => {
    setStatusFilter(value);
    loadData(search, value);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este colaborador?')) return;

    ColaboradorService.deleteById(id)
      .then((resp) => {
        if (resp instanceof Error) {
          showSnackbarMessage(resp.message, 'error');
        } else {
          showSnackbarMessage('Colaborador excluído com sucesso');
          loadData(search, statusFilter);
        }
      });
  };

  return (
    <PageContainer
      toolbar={
        <SearchToolbar
          showMenuButton
          onClickNew={() => navigate('/rh/colaboradores/cadastrar')}
          searchValue={search}
          onSearchChange={handleSearchChange}
        >
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value as ColaboradorStatus | '')}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {STATUS_COLABORADOR_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            startIcon={<Icon>checklist</Icon>}
            onClick={() => navigate('/rh/checklist-templates')}
            size="small"
          >
            Templates
          </Button>
        </SearchToolbar>
      }
    >
      <VTable h={'95px'} titles={['', 'Nome', 'Cargo', 'Setor', 'Status', 'Score', '']}>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7}>
                <LinearProgress />
              </TableCell>
            </TableRow>
          )}
          {!isLoading && rows.map((item) => (
            <TableRow
              key={item.id}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/rh/colaboradores/${item.id}`)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <IconButton
                  onClick={() => navigate(`/rh/colaboradores/editar/${item.id}`)}
                  title="Editar"
                  size="small"
                >
                  <Icon>edit</Icon>
                </IconButton>
              </TableCell>
              <TableCell>
                <Typography fontWeight={500}>{item.nome}</Typography>
                {item.email && (
                  <Typography variant="caption" color="text.secondary">
                    {item.email}
                  </Typography>
                )}
              </TableCell>
              <TableCell>{item.cargo || '-'}</TableCell>
              <TableCell>{item.setor || '-'}</TableCell>
              <TableCell>
                <Chip
                  label={getStatusLabel(item.status)}
                  color={getStatusColor(item.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={item.scoreIntegracao || 0}
                    sx={{ width: 60, height: 8, borderRadius: 4 }}
                    color={item.scoreIntegracao >= 80 ? 'success' : item.scoreIntegracao >= 50 ? 'warning' : 'error'}
                  />
                  <Typography variant="caption">{item.scoreIntegracao || 0}%</Typography>
                </Box>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <IconButton
                  onClick={() => handleDelete(item.id)}
                  title="Excluir"
                  size="small"
                  color="error"
                >
                  <Icon>delete</Icon>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <VTableFooter isLoading={isLoading} colSpan={7}>
          <Typography fontWeight={500} my={0.5}>
            Total: {rows.length} colaboradores
          </Typography>
        </VTableFooter>
      </VTable>
    </PageContainer>
  );
};

export default ColaboradorList;
