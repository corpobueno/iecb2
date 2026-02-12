import React, { useEffect, useMemo, useState } from 'react';
import { Box, Icon, IconButton, Pagination, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AcompanhamentoService } from '../../api/services/AcompanhamentoService';
import { useDebounce } from '../../hooks/UseDebounce';
import { VTable, VTableFooter } from '../../components/grids/VTable';
import { PageContainer } from '../../components/containers/PageContainer';
import { SearchToolbar } from '../../components/contents/SearchToolbar';
import { IAcompanhamento } from '../../entities/Iecb';
import { useSnackbar } from '../../contexts/SnackBarProvider';
import { formatDate, toTel } from '../../utils/functions';

const AcompanhamentoList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSnackbarMessage } = useSnackbar();
  const navigate = useNavigate();
  const { debounce } = useDebounce();

  const [rows, setRows] = useState<IAcompanhamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const filter = useMemo(() => searchParams.get('filter') || '', [searchParams]);
  const page = useMemo(() => Number(searchParams.get('page') || '1'), [searchParams]);

  const loadData = () => {
    AcompanhamentoService.find(page, filter)
      .then((resp) => {
        setIsLoading(false);
        if (resp instanceof Error) {
          showSnackbarMessage(resp.message, 'error');
        } else {
          setRows(resp.data);
          setTotalCount(resp.totalCount);
        }
      });
  };

  useEffect(() => {
    setIsLoading(true);
    debounce(() => loadData());
  }, [filter, page]);

  const handleDelete = (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;

    AcompanhamentoService.deleteById(id)
      .then((resp) => {
        if (resp instanceof Error) {
          showSnackbarMessage(resp.message, 'error');
        } else {
          showSnackbarMessage('Excluído com sucesso');
          loadData();
        }
      });
  };

  return (
    <PageContainer
      toolbar={
        <SearchToolbar
          showMenuButton
          showInputSearch
          textSearch={filter}
          onClickNew={() => navigate('/acompanhamento/cadastrar')}
          handleSearchChange={(text) => setSearchParams({ filter: text, page: '1' }, { replace: true })}
        />
      }
    >
      <VTable h={'95px'} titles={['', 'Nome', 'Telefone', 'Email', 'Interesse', 'Data', '']}>
        <TableBody>
          {rows.map((item) => (
            <TableRow key={item.id} sx={{ cursor: 'pointer' }}>
              <TableCell>
                <IconButton onClick={() => navigate(`/acompanhamento/editar/${item.id}`)} title="Editar">
                  <Icon>edit</Icon>
                </IconButton>
              </TableCell>
              <TableCell>{item.nome}</TableCell>
              <TableCell>{toTel(item.telefone)}</TableCell>
              <TableCell>{item.email || '-'}</TableCell>
              <TableCell>{item.interesse || '-'}</TableCell>
              <TableCell>{formatDate(item.dataCadastro)}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(item.id)} title="Excluir">
                  <Icon>delete</Icon>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <VTableFooter isLoading={isLoading} colSpan={7}>
          <Box display="flex" alignItems="center" gap={2}>
            <Pagination
              page={page}
              count={Math.ceil(totalCount / 30)}
              onChange={(_, newPage) => setSearchParams({ filter, page: newPage.toString() }, { replace: true })}
            />
            <Typography fontWeight={500}>({totalCount})</Typography>
          </Box>
        </VTableFooter>
      </VTable>
    </PageContainer>
  );
};

export default AcompanhamentoList;
