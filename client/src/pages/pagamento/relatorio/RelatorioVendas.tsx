import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { PagamentoService } from '../../../api/services/PagamentoService';
import { IRelatorioVendasResult } from '../../../entities/Iecb';
import { PagamentoCaixaFiltros, IPagamentoCaixaFiltros } from '../caixa/components/PagamentoCaixaFiltros';
import { PageContainer } from '../../../components/containers/PageContainer';
import { SearchToolbar } from '../../../components/contents/SearchToolbar';
import { RelatorioVendasResumo } from './components/RelatorioVendasResumo';
import { RelatorioCategorias } from './components/RelatorioCategorias';
import { RelatorioProdutos } from './components/RelatorioProdutos';

const emptyResult: IRelatorioVendasResult = {
  totalGeral: 0,
  totalCursos: 0,
  totalProdutos: 0,
  categorias: [],
  produtos: [],
};

const RelatorioVendas: React.FC = () => {
  const initialFilters: IPagamentoCaixaFiltros = {
    data_inicio: dayjs().startOf('month').format('YYYY-MM-DD'),
    data_fim: dayjs().format('YYYY-MM-DD'),
  };

  const [filters, setFilters] = useState<IPagamentoCaixaFiltros>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<IRelatorioVendasResult>(emptyResult);

  useEffect(() => {
    setIsLoading(true);
    PagamentoService.getRelatorioVendas(filters).then((result) => {
      setIsLoading(false);
      if (result instanceof Error) {
        alert('Erro ao carregar relatório');
      } else {
        setData(result);
      }
    });
  }, [filters]);

  const hasData = data.totalGeral !== 0 || data.categorias.length > 0 || data.produtos.length > 0;

  return (
    <PageContainer
      toolbar={
        <SearchToolbar showMenuButton={false} showInputSearch={false} showNewButton={false}>
          <PagamentoCaixaFiltros
            onFilterChange={setFilters}
            initialFilters={initialFilters}
          />
        </SearchToolbar>
      }
    >
      <Box px={1} display="flex" flexDirection="column" gap={2} sx={{ maxHeight: 'calc(100vh - 135px)' }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <Typography>Carregando</Typography>
          </Box>
        ) : !hasData ? (
          <Box display="flex" justifyContent="center" p={2}>
            <Typography>Sem Registros</Typography>
          </Box>
        ) : (
          <>
            <RelatorioVendasResumo data={data} />
            <RelatorioCategorias categorias={data.categorias} />
            <RelatorioProdutos produtos={data.produtos} total={data.totalProdutos} />
          </>
        )}
      </Box>
    </PageContainer>
  );
};

export default RelatorioVendas;
