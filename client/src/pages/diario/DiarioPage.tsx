import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { PictureAsPdf, AccessTime, CheckCircle } from '@mui/icons-material';
import { DiarioService } from '../../api/services/DiarioService';
import { IDiarioAula, IDiarioFilters, IDiarioResponse } from '../../entities/Iecb';
import { toCash } from '../../utils/functions';
import { createDiarioPDF } from './utils/createDiarioPDF';
import { PageContainer } from '../../components/containers/PageContainer';

export const DiarioPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [diarioData, setDiarioData] = useState<IDiarioResponse | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState<IDiarioFilters>({
    dataInicio: today,
    dataFim: today,
    docente: undefined,
    usuario: undefined,
    status: undefined,
    tipo: undefined,
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await DiarioService.getDiario(filters);
      if (!(result instanceof Error)) {
        setDiarioData(result);
      }
    } catch (error) {
      console.error('Erro ao carregar diário:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (name: keyof IDiarioFilters, value: string | number | undefined) => {
    if (name === 'dataInicio' && filters.dataFim && value && value > filters.dataFim) {
      setFilters({ ...filters, dataInicio: value as string, dataFim: value as string });
    } else if (name === 'dataFim' && filters.dataInicio && value && value < filters.dataInicio) {
      setFilters({ ...filters, dataInicio: value as string, dataFim: value as string });
    } else {
      setFilters({ ...filters, [name]: value === '' ? undefined : value });
    }
  };

  const getTipoLabel = (tipo: number) => {
    switch (tipo) {
      case 1:
        return <Chip size="small" label="A" sx={{ bgcolor: '#d3912e', color: 'white', fontWeight: 600 }} />;
      case 2:
        return <Chip size="small" label="M" sx={{ bgcolor: '#701d97', color: 'white', fontWeight: 600 }} />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: number) => {
    return status === 1 ? (
      <Tooltip title="Pago">
        <CheckCircle sx={{ color: '#1c992d', fontSize: 18 }} />
      </Tooltip>
    ) : (
      <Tooltip title="Agendado">
        <AccessTime sx={{ color: '#888', fontSize: 18 }} />
      </Tooltip>
    );
  };

  const calculateRateio = (aula: IDiarioAula) => {
    let total = 0;
    for (const aluno of aula.alunos) {
      if (aluno.status === 1) {
        if (aula.rateioModelo && aluno.tipo === 2) {
          total += aluno.valor;
        } else if (aluno.tipo === 1) {
          const rateioPercent = aula.count > 3 ? (aula.rateioRegular || aula.rateio) : aula.rateio;
          total += (aluno.valor * rateioPercent) / 100;
        }
      }
    }
    return total;
  };

  const calculateTotalRateio = () => {
    if (!diarioData) return 0;
    return diarioData.itens.reduce((acc, aula) => acc + calculateRateio(aula), 0);
  };

  const handleExportPDF = async () => {
    if (diarioData) {
      await createDiarioPDF(filters, diarioData.itens);
    }
  };

  return (
    <PageContainer>
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Data Início"
              type="date"
              size="small"
              value={filters.dataInicio}
              onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150 }}
            />
            <TextField
              label="Data Fim"
              type="date"
              size="small"
              value={filters.dataFim}
              onChange={(e) => handleFilterChange('dataFim', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Professora</InputLabel>
              <Select
                value={filters.docente || ''}
                label="Professora"
                onChange={(e) => handleFilterChange('docente', e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {diarioData?.docentes.map((doc) => (
                  <MenuItem key={doc.id} value={doc.id}>
                    {doc.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Usuário</InputLabel>
              <Select
                value={filters.usuario || ''}
                label="Usuário"
                onChange={(e) => handleFilterChange('usuario', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {diarioData?.users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status ?? ''}
                label="Status"
                onChange={(e) =>
                  handleFilterChange('status', e.target.value === '' ? undefined : Number(e.target.value))
                }
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value={1}>Pago</MenuItem>
                <MenuItem value={0}>Pendente</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="error"
              startIcon={<PictureAsPdf />}
              onClick={handleExportPDF}
              disabled={!diarioData || diarioData.itens.length === 0}
            >
              Exportar PDF
            </Button>
          </Box>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : diarioData && diarioData.itens.length > 0 ? (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {diarioData.itens.map((aula) => (
                <Card key={aula.id} variant="outlined">
                  <CardHeader
                    title={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {aula.nomeDocente} - {aula.nomeCurso}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {aula.data.split('-').reverse().join('/')} | Código: {aula.id}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            Total: {toCash(aula.soma)} | Alunos: {aula.count}
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="primary">
                            Rateio: {toCash(calculateRateio(aula))}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ bgcolor: aula.color ? `${aula.color}20` : 'grey.100', py: 1 }}
                  />
                  <CardContent sx={{ p: 0 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell width={40}>Tipo</TableCell>
                          <TableCell>Nome</TableCell>
                          <TableCell width={100} align="right">
                            Valor
                          </TableCell>
                          <TableCell width={100} align="right">
                            Rateio
                          </TableCell>
                          <TableCell width={60} align="center">
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {aula.alunos.map((aluno) => {
                          let rateioAluno = 0;
                          if (aluno.status === 1) {
                            if (aula.rateioModelo && aluno.tipo === 2) {
                              rateioAluno = aluno.valor;
                            } else if (aluno.tipo === 1) {
                              const rateioPercent =
                                aula.count > 3 ? (aula.rateioRegular || aula.rateio) : aula.rateio;
                              rateioAluno = (aluno.valor * rateioPercent) / 100;
                            }
                          }

                          return (
                            <TableRow key={aluno.id}>
                              <TableCell>{getTipoLabel(aluno.tipo)}</TableCell>
                              <TableCell>{aluno.nomeAluno}</TableCell>
                              <TableCell align="right">{toCash(aluno.valor)}</TableCell>
                              <TableCell align="right">{toCash(rateioAluno)}</TableCell>
                              <TableCell align="center">{getStatusIcon(aluno.status)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Paper sx={{ p: 2, mt: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Total Rateio</Typography>
                <Typography variant="h5" fontWeight={600}>
                  {toCash(calculateTotalRateio())}
                </Typography>
              </Box>
            </Paper>
          </>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Nenhum registro encontrado para o período selecionado.
            </Typography>
          </Paper>
        )}
      </Box>
    </PageContainer>
  );
};
