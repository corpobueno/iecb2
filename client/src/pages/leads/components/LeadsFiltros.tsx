// LeadsFiltros.tsx - Filtros para leads_iecb

import { useState, useCallback } from 'react';
import { Box, TextField, FormControlLabel, Switch, Button, useMediaQuery, Theme } from '@mui/material';
import { FilterButton, IFilterInputs } from '../../../utils/Filter';
import { getStorage } from '../../../utils/functions';
import { executeExport, ExportDialog } from './loadExport';
import { ILeadsFiltros } from '../../../entities/Iecb';
import { LiaFileExcel } from 'react-icons/lia';
import dayjs from 'dayjs';
import { getStatusList } from '../status';

interface ILeadsFiltrosProps {
  onFilterChange: (filters: ILeadsFiltros) => void;
  initialFilters: ILeadsFiltros;
}

export const LeadsFiltros: React.FC<ILeadsFiltrosProps> = ({
  onFilterChange,
  initialFilters,
}) => {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));
  const [filters, setFilters] = useState<ILeadsFiltros & { filter?: string }>(initialFilters);
  const [mostrarTodos, setMostrarTodos] = useState(!initialFilters.usuario);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const statusList = getStatusList('leads_iecb');

  const updateFilters = useCallback((newFilters: Partial<ILeadsFiltros & { filter?: string }>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  }, [filters, onFilterChange]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'data_inicio') {
      const updated = { [name]: value + '-01' };
      updateFilters(updated);
    } else if (name === 'data_fim') {
      const updated = { [name]: value + dayjs(value + '-01').endOf('month').format('-DD') };
      updateFilters(updated);
    } else {
      updateFilters({ [name]: value });
    }
  }, [updateFilters]);

  const handleMostrarTodosChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setMostrarTodos(checked);
    updateFilters({ usuario: checked ? '' : getStorage('login') });
  }, [updateFilters]);

  const clearFilters = useCallback(() => {
    const currentSelecao = filters.selecao;
    updateFilters({ ...initialFilters, selecao: currentSelecao });
  }, [updateFilters, initialFilters, filters.selecao]);

  const handleOpenExportDialog = useCallback(() => {
    setExportDialogOpen(true);
  }, []);

  const handleExportConfirm = useCallback((selecao: string, format: 'csv' | 'xlsx') => {
    executeExport({ ...filters, selecao }, format);
  }, [filters]);

  const filterInputs: IFilterInputs = {
    content: [
      <TextField
        key="data_inicio"
        type="month"
        size="small"
        name="data_inicio"
        label="Início (mês/ano)"
        value={filters.data_inicio ? filters.data_inicio.substring(0, 7) : ''}
        onChange={handleFilterChange}
        InputLabelProps={{ shrink: true }}
      />,
      <TextField
        key="data_fim"
        type="month"
        size="small"
        name="data_fim"
        label="Fim (mês/ano)"
        value={filters.data_fim ? filters.data_fim.substring(0, 7) : ''}
        onChange={handleFilterChange}
        InputLabelProps={{ shrink: true }}
      />,
      <FormControlLabel
        key="mostrar_todos"
        control={
          <Switch
            checked={mostrarTodos}
            onChange={handleMostrarTodosChange}
            color="primary"
          />
        }
        label="Mostrar todos"
      />,
      <Button
        key="exportar"
        sx={{ mb: 0.2 }}
        variant="contained"
        disableElevation
        color="success"
        onClick={handleOpenExportDialog}
        startIcon={<LiaFileExcel />}
      >
        Exportar
      </Button>,
    ],
    isChecked: [],
  };

  return (
    <>
      <Box display="flex" flexDirection="row" gap={2} alignItems="center" flexWrap="wrap">
        <TextField
          size="small"
          value={filters.filter || ''}
          name="filter"
          sx={{ maxWidth: '70%' }}
          placeholder="Pesquisar..."
          onChange={handleFilterChange}
        />
        {!mdDown && (
          <>
          </>
        )}
        <FilterButton
          filterInputs={filterInputs}
          clear={clearFilters}
        />
      </Box>

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onConfirm={handleExportConfirm}
        statusList={statusList}
      />
    </>
  );
};
