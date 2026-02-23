import { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Icon, IconButton, MenuItem, TableBody, TableCell, TablePagination, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { ProdutoService } from '../../../api/services/ProdutoService';
import { Environment } from '../../../api/axios-config/environment';
import { VTable, VTableFooter } from '../../../components/grids/VTable';
import { PageContainer } from '../../../components/containers/PageContainer';
import { SearchToolbar } from '../../../components/contents/SearchToolbar';
import { ILancamento } from '../../../entities/Iecb';
import { useSnackbar } from '../../../contexts/SnackBarProvider';
import { formatDate } from '../../../utils/functions';

const ProductList = () => {
  const { showSnackbarMessage } = useSnackbar();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rows, setRows] = useState<ILancamento[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Parâmetros da URL
  const filter = useMemo(() => searchParams.get('filter') || '', [searchParams]);
  const usuario = useMemo(() => searchParams.get('usuario') || '', [searchParams]);
  const page = useMemo(() => Number(searchParams.get('page') || '1'), [searchParams]);

  const loadData = useCallback(() => {
    setIsLoading(true);
    ProdutoService.findLancamentos(page, filter, usuario)
      .then((resp) => {
        setIsLoading(false);
        if (resp instanceof Error) {
          showSnackbarMessage(resp.message, 'error');
        } else {
          setRows(resp.data);
          setTotalCount(resp.totalCount);
        }
      });
  }, [page, filter, usuario, showSnackbarMessage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lista de usuários para o filtro
  const usuariosOptions = useMemo(() => {
    const usuarios = [...new Set(rows.map((item) => item.usuario).filter(Boolean))];
    return usuarios.sort();
  }, [rows]);

  const handleSearchChange = (newFilter: string) => {
    setSearchParams({ filter: newFilter, usuario, page: '1' });
  };

  const handleUsuarioChange = (newUsuario: string) => {
    setSearchParams({ filter, usuario: newUsuario, page: '1' });
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setSearchParams({ filter, usuario, page: String(newPage + 1) });
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const totalVendas = rows.reduce((acc, item) => acc + (item.valor || 0), 0);

  const isToday = (date: Date | string) => {
    return dayjs(date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
  };

  const handleDelete = async (item: ILancamento) => {
    if (!isToday(item.data)) {
      showSnackbarMessage('Só é possível excluir lançamentos do dia atual', 'warning');
      return;
    }

    if (!window.confirm(`Confirma a exclusão do lançamento #${item.id}?`)) {
      return;
    }

    const result = await ProdutoService.excluirLancamento(item.id);
    if (result instanceof Error) {
      showSnackbarMessage(result.message, 'error');
    } else {
      showSnackbarMessage('Lançamento excluído com sucesso', 'success');
      loadData();
    }
  };

  return (
    <PageContainer
      toolbar={
        <SearchToolbar
          showMenuButton
          showInputSearch
          textSearch={filter}
          handleSearchChange={handleSearchChange}
          onClickNew={() => navigate('/pagamentos/produto/cadastrar')}
        >
          <TextField
            select
            size="small"
            label="Vendedor"
            value={usuario}
            onChange={(e) => handleUsuarioChange(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {usuariosOptions.map((u) => (
              <MenuItem key={u} value={u}>
                {u}
              </MenuItem>
            ))}
          </TextField>
        </SearchToolbar>
      }
    >
      <VTable h={'95px'} titles={['', 'Data', 'Cliente', 'Produto', 'Valor', 'Qtd', 'Vendedor', '']}>
        <TableBody>
          {rows.map((item) => (
            <TableRow key={item.id} sx={{ cursor: 'pointer' }}>
              <TableCell>
                <Tooltip title={isToday(item.data) ? 'Editar' : 'Só é possível editar lançamentos de hoje'}>
                  <span>
                    <IconButton
                      onClick={() => navigate(`/pagamentos/produto/editar/${item.id}`)}
                      disabled={!isToday(item.data)}
                    >
                      <Icon>edit</Icon>
                    </IconButton>
                  </span>
                </Tooltip>
              </TableCell>
              <TableCell>{formatDate(item.data)}</TableCell>
              <TableCell>{item.nomeCliente || '-'}</TableCell>
              <TableCell>{item.nomeProduto || '-'}</TableCell>
              <TableCell>
                <Typography color="success.main" fontWeight={500}>
                  {formatCurrency(item.valor)}
                </Typography>
              </TableCell>
              <TableCell>{item.qnt || 1}</TableCell>
              <TableCell>{item.usuario}</TableCell>
              <TableCell>
                <Tooltip title={isToday(item.data) ? 'Excluir' : 'Só é possível excluir lançamentos de hoje'}>
                  <span>
                    <IconButton
                      onClick={() => handleDelete(item)}
                      disabled={!isToday(item.data)}
                      color={isToday(item.data) ? 'error' : 'default'}
                    >
                      <Icon>delete</Icon>
                    </IconButton>
                  </span>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <VTableFooter isLoading={isLoading} colSpan={8}>
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Box display="flex" alignItems="center" gap={2}>
              <Typography fontWeight={500}>
                Total página: {formatCurrency(totalVendas)}
              </Typography>
              <Typography>({totalCount} registros)</Typography>
            </Box>
            <TablePagination
              component="div"
              count={totalCount}
              page={page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={Environment.LIMITE_DE_LINHAS}
              rowsPerPageOptions={[Environment.LIMITE_DE_LINHAS]}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </Box>
        </VTableFooter>
      </VTable>
    </PageContainer>
  );
};

export default ProductList;
