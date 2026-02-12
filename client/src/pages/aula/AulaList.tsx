import React, { useEffect, useState } from 'react';
import { Box, Chip, Icon, IconButton, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AulaService } from '../../api/services/AulaService';
import { VTable, VTableFooter } from '../../components/grids/VTable';
import { PageContainer } from '../../components/containers/PageContainer';
import { SearchToolbar } from '../../components/contents/SearchToolbar';
import { IAula } from '../../entities/Iecb';
import { useSnackbar } from '../../contexts/SnackBarProvider';
import { formatDate } from '../../utils/functions';

const AulaList = () => {
  const { showSnackbarMessage } = useSnackbar();
  const navigate = useNavigate();

  const [rows, setRows] = useState<IAula[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    AulaService.find()
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
    if (!window.confirm('Tem certeza que deseja excluir esta aula?')) return;

    AulaService.deleteById(id)
      .then((resp) => {
        if (resp instanceof Error) {
          showSnackbarMessage(resp.message, 'error');
        } else {
          showSnackbarMessage('Aula excluída com sucesso');
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
          onClickNew={() => navigate('/aulas/cadastrar')}
        />
      }
    >
      <VTable h={'95px'} titles={['', 'Curso', 'Docente', 'Valor', 'Qnt', 'Data', '']}>
        <TableBody>
          {rows.map((item) => (
            <TableRow key={item.id} sx={{ cursor: 'pointer' }}>
              <TableCell>
                <IconButton onClick={() => navigate(`/aulas/editar/${item.id}`)} title="Editar">
                  <Icon>edit</Icon>
                </IconButton>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.color && (
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                      }}
                    />
                  )}
                  {item.nomeCurso || '-'}
                </Box>
              </TableCell>
              <TableCell>{item.nomeDocente || item.docente}</TableCell>
              <TableCell>{formatCurrency(item.valor)}</TableCell>
              <TableCell>{item.qnt || 1}</TableCell>
              <TableCell>{formatDate(item.dataAgendado)}</TableCell>
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

export default AulaList;
