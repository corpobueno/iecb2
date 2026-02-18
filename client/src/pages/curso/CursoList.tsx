import { useEffect, useState } from 'react';
import { Box, Icon, IconButton, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CursoService } from '../../api/services/CursoService';
import { VTable, VTableFooter } from '../../components/grids/VTable';
import { PageContainer } from '../../components/containers/PageContainer';
import { SearchToolbar } from '../../components/contents/SearchToolbar';
import { ICurso } from '../../entities/Iecb';
import { useSnackbar } from '../../contexts/SnackBarProvider';

const CursoList = () => {
  const { showSnackbarMessage } = useSnackbar();
  const navigate = useNavigate();

  const [rows, setRows] = useState<ICurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    CursoService.find()
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

  const handleDelete = (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este curso?')) return;

    CursoService.deleteById(id)
      .then((resp) => {
        if (resp instanceof Error) {
          showSnackbarMessage(resp.message, 'error');
        } else {
          showSnackbarMessage('Curso excluído com sucesso');
          loadData();
        }
      });
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
          onClickNew={() => navigate('/cursos/cadastrar')}
        />
      }
    >
      <VTable h={'95px'} titles={['', 'Nome', 'Categoria', 'Valor', 'Duração', 'Cor', '']}>
        <TableBody>
          {rows.map((item) => (
            <TableRow key={item.id} sx={{ cursor: 'pointer' }}>
              <TableCell>
                <IconButton onClick={() => navigate(`/cursos/editar/${item.id}`)} title="Editar">
                  <Icon>edit</Icon>
                </IconButton>
              </TableCell>
              <TableCell>{item.nome}</TableCell>
              <TableCell>{item.categoria || '-'}</TableCell>
              <TableCell>{formatCurrency(item.valor)}</TableCell>
              <TableCell>{item.duracao || '-'}</TableCell>
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

export default CursoList;
