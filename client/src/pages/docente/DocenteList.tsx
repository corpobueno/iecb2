import React, { useEffect, useState } from 'react';
import { Box, Icon, IconButton, TableBody, TableCell, TableRow, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DocenteService } from '../../api/services/DocenteService';
import { VTable, VTableFooter } from '../../components/grids/VTable';
import { PageContainer } from '../../components/containers/PageContainer';
import { SearchToolbar } from '../../components/contents/SearchToolbar';
import { IDocente } from '../../entities/Iecb';
import { useSnackbar } from '../../contexts/SnackBarProvider';

const DocenteList = () => {
  const { showSnackbarMessage } = useSnackbar();
  const navigate = useNavigate();

  const [rows, setRows] = useState<IDocente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<number>(1);

  const loadData = (ativo: number) => {
    setIsLoading(true);
    DocenteService.find(ativo)
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
    loadData(filtroAtivo);
  }, [filtroAtivo]);

  const handleFiltroChange = (_: React.MouseEvent<HTMLElement>, newValue: number | null) => {
    if (newValue !== null) {
      setFiltroAtivo(newValue);
    }
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este docente?')) return;

    DocenteService.deleteById(id)
      .then((resp) => {
        if (resp instanceof Error) {
          showSnackbarMessage(resp.message, 'error');
        } else {
          showSnackbarMessage('Docente excluído com sucesso');
          loadData(filtroAtivo);
        }
      });
  };

  return (
    <PageContainer
      toolbar={
        <SearchToolbar
          showMenuButton
          onClickNew={() => navigate('/docentes/cadastrar')}
        >
          <ToggleButtonGroup
            value={filtroAtivo}
            exclusive
            onChange={handleFiltroChange}
            size="small"
          >
            <ToggleButton value={1}>Ativos</ToggleButton>
            <ToggleButton value={0}>Inativos</ToggleButton>
          </ToggleButtonGroup>
        </SearchToolbar>
      }
    >
      <VTable h={'95px'} titles={['', 'Login', 'Nome', 'Rateio', 'Rateio Regular', 'Cor', '']}>
        <TableBody>
          {rows.map((item) => (
            <TableRow key={item.id} sx={{ cursor: 'pointer' }}>
              <TableCell>
                <IconButton onClick={() => navigate(`/docentes/editar/${item.id}`)} title="Editar">
                  <Icon>edit</Icon>
                </IconButton>
              </TableCell>
              <TableCell>{item.login}</TableCell>
              <TableCell>{item.nome}</TableCell>
              <TableCell>{item.rateio ? `${item.rateio}%` : '-'}</TableCell>
              <TableCell>{item.rateioRegular ? `${item.rateioRegular}%` : '-'}</TableCell>
              <TableCell>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: item.color || '#ccc',
                  }}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(item.id)} title="Excluir">
                  <Icon>delete</Icon>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <VTableFooter isLoading={isLoading} colSpan={7}>
          <Typography fontWeight={500} my={0.5}>
            Total: {rows.length}
          </Typography>
        </VTableFooter>
      </VTable>
    </PageContainer>
  );
};

export default DocenteList;
