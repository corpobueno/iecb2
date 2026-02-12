import React, { useEffect, useState } from 'react';
import { Box, Icon, IconButton, MenuItem, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PagamentoService } from '../../api/services/PagamentoService';
import { AcompanhamentoService } from '../../api/services/AcompanhamentoService';
import { VTable, VTableFooter } from '../../components/grids/VTable';
import { PageContainer } from '../../components/containers/PageContainer';
import { SearchToolbar } from '../../components/contents/SearchToolbar';
import { IPagamento, IAcompanhamento } from '../../entities/Iecb';
import { useSnackbar } from '../../contexts/SnackBarProvider';
import { formatDate } from '../../utils/functions';

const PagamentoList = () => {
  const { showSnackbarMessage } = useSnackbar();
  const navigate = useNavigate();

  const [rows, setRows] = useState<IPagamento[]>([]);
  const [clientes, setClientes] = useState<IAcompanhamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState<number>(0);

  useEffect(() => {
    AcompanhamentoService.find(1, '').then((resp) => {
      if (!(resp instanceof Error)) {
        setClientes(resp.data);
        if (resp.data.length > 0 && !selectedCliente) {
          setSelectedCliente(resp.data[0].id);
        }
      }
    });
  }, []);

  const loadData = () => {
    if (!selectedCliente) return;

    setIsLoading(true);
    PagamentoService.findByCliente(selectedCliente)
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
  }, [selectedCliente]);

  const handleDelete = (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este pagamento?')) return;

    PagamentoService.deleteById(id)
      .then((resp) => {
        if (resp instanceof Error) {
          showSnackbarMessage(resp.message, 'error');
        } else {
          showSnackbarMessage('Pagamento excluído com sucesso');
          loadData();
        }
      });
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const totalPagamentos = rows.reduce((acc, item) => acc + (item.valor || 0), 0);

  return (
    <PageContainer
      toolbar={
        <SearchToolbar
          showMenuButton
          onClickNew={() => navigate(`/pagamentos/cadastrar?idCliente=${selectedCliente}`)}
        >
          <TextField
            select
            size="small"
            label="Cliente"
            value={selectedCliente}
            onChange={(e) => setSelectedCliente(Number(e.target.value))}
            sx={{ minWidth: 250 }}
          >
            {clientes.map((cliente) => (
              <MenuItem key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </MenuItem>
            ))}
          </TextField>
        </SearchToolbar>
      }
    >
      <VTable h={'95px'} titles={['', 'Data', 'Curso', 'Valor', 'Caixa', '']}>
        <TableBody>
          {rows.map((item) => (
            <TableRow key={item.id} sx={{ cursor: 'pointer' }}>
              <TableCell>
                <IconButton onClick={() => navigate(`/pagamentos/editar/${item.id}`)} title="Editar">
                  <Icon>edit</Icon>
                </IconButton>
              </TableCell>
              <TableCell>{formatDate(item.data)}</TableCell>
              <TableCell>{item.nomeCurso || 'Crédito'}</TableCell>
              <TableCell>
                <Typography
                  color={item.valor >= 0 ? 'success.main' : 'error.main'}
                  fontWeight={500}
                >
                  {formatCurrency(item.valor)}
                </Typography>
              </TableCell>
              <TableCell>{item.caixa}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(item.id)} title="Excluir">
                  <Icon>delete</Icon>
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <VTableFooter isLoading={isLoading} colSpan={6}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography fontWeight={500}>
              Total: {formatCurrency(totalPagamentos)}
            </Typography>
            <Typography>({rows.length} registros)</Typography>
          </Box>
        </VTableFooter>
      </VTable>
    </PageContainer>
  );
};

export default PagamentoList;
