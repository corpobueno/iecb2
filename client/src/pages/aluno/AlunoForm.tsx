import { Grid, MenuItem } from '@mui/material';
import { VTextField, VFormContainer } from '../../components/forms';
import { IAlunoForm, IAcompanhamento, IAula } from '../../entities/Iecb';
import { useEffect, useState } from 'react';
import { AcompanhamentoService } from '../../api/services/AcompanhamentoService';
import { AulaService } from '../../api/services/AulaService';

interface Props {
  handleSave: (data: IAlunoForm) => void;
  methods: any;
  isLoading?: boolean;
  project: IAlunoForm;
  defaultIdAula?: number;
}

export const AlunoForm = ({ handleSave, isLoading = false, project, methods, defaultIdAula }: Props) => {
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
        methods.setValue(key, project[key as keyof IAlunoForm]);
      });
    }
    if (defaultIdAula && !project.idAula) {
      methods.setValue('idAula', defaultIdAula);
    }
  }, [project, methods, defaultIdAula]);

  return (
    <VFormContainer sx={{ maxHeight: 'calc(100vh - 90px)', overflow: 'auto' }} methods={methods} handleSave={handleSave}>
      <Grid container item direction="row" spacing={2}>
        <Grid item xs={12} sm={6} md={5}>
          <VTextField
            select
            disabled={isLoading}
            fullWidth
            label="Cliente"
            name="idAluno"
          >
            {clientes.map((cliente) => (
              <MenuItem key={cliente.id} value={cliente.id}>
                {cliente.nome} - {cliente.telefone}
              </MenuItem>
            ))}
          </VTextField>
        </Grid>
        <Grid item xs={12} sm={6} md={5}>
          <VTextField
            select
            disabled={isLoading}
            fullWidth
            label="Aula"
            name="idAula"
          >
            {aulas.map((aula) => (
              <MenuItem key={aula.id} value={aula.id}>
                {aula.nomeCurso} - {aula.nomeDocente || aula.docente}
              </MenuItem>
            ))}
          </VTextField>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <VTextField
            select
            disabled={isLoading}
            fullWidth
            label="Tipo"
            name="tipo"
          >
            <MenuItem value={0}>Regular</MenuItem>
            <MenuItem value={1}>Avulso</MenuItem>
            <MenuItem value={2}>Pacote</MenuItem>
          </VTextField>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Valor"
            name="valor"
            type="number"
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Valor Matrícula"
            name="valorMatricula"
            type="number"
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <VTextField
            select
            disabled={isLoading}
            fullWidth
            label="Status"
            name="status"
          >
            <MenuItem value={0}>Matriculado</MenuItem>
            <MenuItem value={1}>Ativo</MenuItem>
            <MenuItem value={2}>Pendente</MenuItem>
            <MenuItem value={3}>Inativo</MenuItem>
          </VTextField>
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Data"
            name="data"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
    </VFormContainer>
  );
};
