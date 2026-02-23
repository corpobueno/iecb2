import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import dayjs from 'dayjs';
import { PagamentoService } from '../../../api/services/PagamentoService';
import { ICaixaPagamentoResult } from '../../../entities/Iecb';
import { PagamentoCaixaFiltros, IPagamentoCaixaFiltros } from './components/PagamentoCaixaFiltros';
import { PagamentoCaixaGeral } from './components/PagamentoCaixaGeral';
import { PageContainer } from '../../../components/containers/PageContainer';
import { SearchToolbar } from '../../../components/contents/SearchToolbar';
import { createCaixaPDF } from './utils/createCaixaPDF';

const PagamentoCaixa: React.FC = () => {
  const initialFilters: IPagamentoCaixaFiltros = {
    data_inicio: dayjs().startOf('month').format('YYYY-MM-DD'),
    data_fim: dayjs().format('YYYY-MM-DD'),
  };

  const [filters, setFilters] = useState<IPagamentoCaixaFiltros>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [caixaData, setCaixaData] = useState<ICaixaPagamentoResult>({
    pagamentos: [],
    bonificacoes: [],
    sumPagamentos: 0,
    sumBonificacoes: 0,
  });

  const loadData = (filterParams?: IPagamentoCaixaFiltros) => {
    const params = filterParams || filters;

    setIsLoading(true);
    PagamentoService.getCaixaPagamentos(params)
      .then((result) => {
        setIsLoading(false);
        if (result instanceof Error) {
          alert('Erro ao carregar');
        } else {
          setCaixaData(result);
        }
      });
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleFilterChange = (newFilters: IPagamentoCaixaFiltros) => {
    setFilters(newFilters);
  };

  const hasData = caixaData.sumPagamentos > 0 || caixaData.sumBonificacoes > 0;

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await createCaixaPDF(filters, caixaData);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <PageContainer
      toolbar={
        <SearchToolbar
          showMenuButton={false}
          showInputSearch={false}
          showNewButton={false}
        >
          <Box display="flex" gap={1} alignItems="center">
            <PagamentoCaixaFiltros
              onFilterChange={handleFilterChange}
              initialFilters={initialFilters}
            />
            <Tooltip title={isGeneratingPDF ? 'Gerando PDF...' : 'Gerar PDF'}>
              <span>
                <IconButton
                  onClick={handleGeneratePDF}
                  disabled={!hasData || isLoading || isGeneratingPDF}
                  color="primary"
                >
                  {isGeneratingPDF ? <CircularProgress size={24} /> : <PictureAsPdfIcon />}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
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
          <PagamentoCaixaGeral caixaData={caixaData} filtros={filters} />
        )}
      </Box>
    </PageContainer>
  );
};

export default PagamentoCaixa;
