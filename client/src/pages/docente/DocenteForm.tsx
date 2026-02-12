import { Grid } from '@mui/material';
import { VTextField, VFormContainer, VSwitch } from '../../components/forms';
import { IDocenteForm } from '../../entities/Iecb';

interface Props {
  handleSave: (data: IDocenteForm) => void;
  methods: any;
  isLoading?: boolean;
  project: IDocenteForm;
  isEditing?: boolean;
}

export const DocenteForm = ({ handleSave, isLoading = false, project, methods, isEditing = false }: Props) => {
  return (
    <VFormContainer sx={{ maxHeight: 'calc(100vh - 90px)', overflow: 'auto' }} methods={methods} handleSave={handleSave}>
      <Grid container item direction="row" spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Login"
            name="login"
            defaultValue={project.login}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Nome"
            name="nome"
            defaultValue={project.nome}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Rateio (%)"
            name="rateio"
            type="number"
            defaultValue={project.rateio}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Rateio Regular (%)"
            name="rateioRegular"
            type="number"
            defaultValue={project.rateioRegular}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Cor"
            name="color"
            type="color"
            defaultValue={project.color || '#1976d2'}
          />
        </Grid>
        {isEditing && (
          <Grid item xs={6} sm={4} md={2}>
            <VSwitch
              name="ativo"
              label="Ativo"
              disabled={isLoading}
            />
          </Grid>
        )}
      </Grid>
    </VFormContainer>
  );
};
