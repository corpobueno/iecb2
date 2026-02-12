import { Grid, MenuItem } from '@mui/material';
import { VTextField, VFormContainer } from '../../components/forms';
import { ICurso, IDocente } from '../../entities/Iecb';
import { useEffect, useState } from 'react';
import { CursoService } from '../../api/services/CursoService';
import { DocenteService } from '../../api/services/DocenteService';
import { VCash } from '../../components/forms/VCash';

export interface IAgendaCompleteForm {
  // Campos da Aula
  idCurso: number;
  docente: string;
  valor: number;
  // Campos da Agenda
  data: string;
  hora: string;
  horaFim: string;
  nota?: string;
}

interface Props {
  handleSave: (data: IAgendaCompleteForm) => void;
  methods: any;
  isLoading?: boolean;
  project: IAgendaCompleteForm;
  defaultData?: string;
}

export const AgendaForm = ({ handleSave, isLoading = false, project, methods, defaultData }: Props) => {
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [docentes, setDocentes] = useState<IDocente[]>([]);

  useEffect(() => {
    Promise.all([
      CursoService.find(),
      DocenteService.find(),
    ]).then(([cursosResp, docentesResp]) => {
      if (!(cursosResp instanceof Error)) {
        setCursos(cursosResp.data);
      }
      if (!(docentesResp instanceof Error)) {
        setDocentes(docentesResp.data);
      }
    });
  }, []);

  useEffect(() => {
    if (project) {
      const values = { ...project };
      if (defaultData && !project.data) {
        values.data = defaultData;
      }
      methods.reset(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, defaultData]);

  return (
    <VFormContainer sx={{ maxHeight: 'calc(100vh - 90px)', overflow: 'auto' }} methods={methods} handleSave={handleSave}>
      <Grid container item direction="row" spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <VTextField
            select
            disabled={isLoading}
            fullWidth
            label="Curso"
            name="idCurso"
          >
            {cursos.map((curso) => (
              <MenuItem key={curso.id} value={curso.id}>
                {curso.nome}
              </MenuItem>
            ))}
          </VTextField>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <VTextField
            select
            disabled={isLoading}
            fullWidth
            label="Professora"
            name="docente"
          >
            {docentes.map((docente) => (
              <MenuItem key={docente.login} value={docente.login}>
                {docente.nome}
              </MenuItem>
            ))}
          </VTextField>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <VCash
            disabled={isLoading}
            fullWidth
            label="Valor"
            name="valor"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Data"
            name="data"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Hora Inicio"
            name="hora"
            type="time"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={2}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Hora Fim"
            name="horaFim"
            type="time"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Observacao"
            name="nota"
            multiline
            rows={3}
          />
        </Grid>
      </Grid>
    </VFormContainer>
  );
};
