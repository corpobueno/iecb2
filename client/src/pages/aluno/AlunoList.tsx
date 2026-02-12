import React, { useEffect, useState } from 'react';
import { Box, Chip, Icon, IconButton, MenuItem, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlunoService } from '../../api/services/AlunoService';
import { AulaService } from '../../api/services/AulaService';
import { VTable, VTableFooter } from '../../components/grids/VTable';
import { PageContainer } from '../../components/containers/PageContainer';
import { SearchToolbar } from '../../components/contents/SearchToolbar';
import { IAluno, IAula } from '../../entities/Iecb';
import { useSnackbar } from '../../contexts/SnackBarProvider';
import { toTel } from '../../utils/functions';

const AlunoList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSnackbarMessage } = useSnackbar();
  const navigate = useNavigate();

  const [rows, setRows] = useState<IAluno[]>([]);
  const [aulas, setAulas] = useState<IAula[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAula, setSelectedAula] = useState<number>(0);

  useEffect(() => {
    AulaService.find().then((resp) => {
      if (!(resp instanceof Error)) {
        setAulas(resp.data);
        if (resp.data.length > 0 && !selectedAula) {
          setSelectedAula(resp.data[0].id);
        }
      }
    });
  }, []);

  const loadData = () => {
    if (!selectedAula) return;

    setIsLoading(true);
    AlunoService.findByAula(selectedAula)
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
  }, [selectedAula]);

  const handleDelete = (id: number) => {
    if (!window.confirm('Tem certeza que deseja remover este aluno da aula?')) return;

    AlunoService.deleteById(id)
      .then((resp) => {
        if (resp instanceof Error) {
          showSnackbarMessage(resp.message, 'error');
        } else {
          showSnackbarMessage('Aluno removido com sucesso');
          loadData();
        }
      });
  };

  const getStatusColor = (status?: number) => {
    switch (status) {
      case 1: return 'success';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status?: number) => {
    switch (status) {
      case 1: return 'Ativo';
      case 2: return 'Pendente';
      case 3: return 'Inativo';
      default: return 'Matriculado';
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <PageContainer
      toolbar={
        <SearchToolbar
          showMenuButton
          onClickNew={() => navigate(`/alunos/cadastrar?idAula=${selectedAula}`)}
        >
          <TextField
            select
            size="small"
            label="Aula"
            value={selectedAula}
            onChange={(e) => setSelectedAula(Number(e.target.value))}
            sx={{ minWidth: 250 }}
          >
            {aulas.map((aula) => (
              <MenuItem key={aula.id} value={aula.id}>
                {aula.nomeCurso} - {aula.nomeDocente || aula.docente}
              </MenuItem>
            ))}
          </TextField>
        </SearchToolbar>
      }
    >
      <VTable h={'95px'} titles={['', 'Aluno', 'Telefone', 'Valor', 'Status', '']}>
        <TableBody>
          {rows.map((item) => (
            <TableRow key={item.id} sx={{ cursor: 'pointer' }}>
              <TableCell>
                <IconButton onClick={() => navigate(`/alunos/editar/${item.id}`)} title="Editar">
                  <Icon>edit</Icon>
                </IconButton>
              </TableCell>
              <TableCell>{item.nomeAluno || '-'}</TableCell>
              <TableCell>{toTel(item.telefone || '')}</TableCell>
              <TableCell>{formatCurrency(item.valor)}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={getStatusLabel(item.status)}
                  color={getStatusColor(item.status)}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(item.id)} title="Remover">
                  <Icon>delete</Icon>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <VTableFooter isLoading={isLoading} colSpan={6}>
          <Typography fontWeight={500} my={0.5}>
            Total: {rows.length} alunos
          </Typography>
        </VTableFooter>
      </VTable>
    </PageContainer>
  );
};

export default AlunoList;
