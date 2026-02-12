import { Grid, MenuItem } from '@mui/material';
import { VTextField, VFormContainer } from '../../components/forms';
import { IAulaForm, ICurso, IDocente } from '../../entities/Iecb';
import { useEffect, useState } from 'react';
import { CursoService } from '../../api/services/CursoService';
import { DocenteService } from '../../api/services/DocenteService';

interface Props {
  handleSave: (data: IAulaForm) => void;
  methods: any;
  isLoading?: boolean;
  project: IAulaForm;
}

export const AulaForm = ({ handleSave, isLoading = false, project, methods }: Props) => {
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [docentes, setDocentes] = useState<IDocente[]>([]);

  useEffect(() => {
    CursoService.find().then((resp) => {
      if (!(resp instanceof Error)) {
        setCursos(resp.data);
      }
    });

    DocenteService.find().then((resp) => {
      if (!(resp instanceof Error)) {
        setDocentes(resp.data);
      }
    });
  }, []);

  useEffect(() => {
    if (project.idCurso) {
      methods.setValue('idCurso', project.idCurso);
    }
    if (project.docente) {
      methods.setValue('docente', project.docente);
    }
  }, [project, methods]);

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
            defaultValue={project.idCurso || ''}
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
            label="Docente"
            name="docente"
            defaultValue={project.docente || ''}
          >
            {docentes.map((docente) => (
              <MenuItem key={docente.id} value={docente.login}>
                {docente.nome}
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
            defaultValue={project.valor}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Quantidade"
            name="qnt"
            type="number"
            defaultValue={project.qnt || 1}
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
            defaultValue={project.nota}
          />
        </Grid>
      </Grid>
    </VFormContainer>
  );
};
