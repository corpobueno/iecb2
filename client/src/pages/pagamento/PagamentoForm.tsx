import { Grid, MenuItem } from '@mui/material';
import { VTextField, VFormContainer } from '../../components/forms';
import { IPagamentoForm, IAcompanhamento, IAula } from '../../entities/Iecb';
import { useEffect, useState } from 'react';
import { AcompanhamentoService } from '../../api/services/AcompanhamentoService';
import { AulaService } from '../../api/services/AulaService';

interface Props {
  handleSave: (data: IPagamentoForm) => void;
  methods: any;
  isLoading?: boolean;
  project: IPagamentoForm;
  defaultIdCliente?: number;
}

export const PagamentoForm = ({ handleSave, isLoading = false, project, methods, defaultIdCliente }: Props) => {
  const [clientes, setClientes] = useState<IAcompanhamento[]>([]);
  const [aulas, setAulas] = useState<IAula[]>([]);

  useEffect(() => {
    AcompanhamentoService.find(1, '').then((resp) => {
      if (!(resp instanceof Error)) {
        setClientes(resp.data);
      }
    });

    AulaService.find().then((resp) => {
      if (!(resp instanceof Error)) {
        setAulas(resp.data);
      }
    });
  }, []);

  useEffect(() => {
    if (project) {
      Object.keys(project).forEach((key) => {
        methods.setValue(key, project[key as keyof IPagamentoForm]);
      });
    }
    if (defaultIdCliente && !project.idCliente) {
      methods.setValue('idCliente', defaultIdCliente);
    }
  }, [project, methods, defaultIdCliente]);

  return (
    <VFormContainer sx={{ maxHeight: 'calc(100vh - 90px)', overflow: 'auto' }} methods={methods} handleSave={handleSave}>
      <Grid container item direction="row" spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <VTextField
            select
            disabled={isLoading}
            fullWidth
            label="Cliente"
            name="idCliente"
          >
            {clientes.map((cliente) => (
              <MenuItem key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </MenuItem>
            ))}
          </VTextField>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <VTextField
            select
            disabled={isLoading}
            fullWidth
            label="Aula (opcional)"
            name="idAula"
          >
            <MenuItem value={0}>Nenhuma (Crédito)</MenuItem>
            {aulas.map((aula) => (
              <MenuItem key={aula.id} value={aula.id}>
                {aula.nomeCurso} - {aula.nomeDocente || aula.docente}
              </MenuItem>
            ))}
          </VTextField>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Valor"
            name="valor"
            type="number"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Quantidade"
            name="qnt"
            type="number"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <VTextField
            select
            disabled={isLoading}
            fullWidth
            label="Forma de Pagamento"
            name="idPagamento"
          >
            <MenuItem value={0}>Crédito</MenuItem>
            <MenuItem value={1}>Dinheiro</MenuItem>
            <MenuItem value={2}>PIX</MenuItem>
            <MenuItem value={3}>Cartão Débito</MenuItem>
            <MenuItem value={4}>Cartão Crédito</MenuItem>
          </VTextField>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Valor Matrícula"
            name="valorMatricula"
            type="number"
          />
        </Grid>
      </Grid>
    </VFormContainer>
  );
};
