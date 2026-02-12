import { Grid } from '@mui/material';
import { VTextField, VFormContainer, VPhoneField } from '../../components/forms';
import { ILeadsForm } from '../../entities/Iecb';
import { useEffect } from 'react';

interface Props {
  handleSave: (data: ILeadsForm) => void;
  methods: any;
  isLoading?: boolean;
  project: ILeadsForm;
}

export const LeadsForm = ({ handleSave, isLoading = false, project, methods }: Props) => {
  useEffect(() => {
    if (project) {
      Object.keys(project).forEach((key) => {
        methods.setValue(key, project[key as keyof ILeadsForm]);
      });
    }
  }, [project, methods]);

  return (
    <VFormContainer sx={{ maxHeight: 'calc(100vh - 90px)', overflow: 'auto' }} methods={methods} handleSave={handleSave}>
      <Grid container item direction="row" spacing={2}>
        <Grid item xs={12} sm={8} md={6}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Nome"
            name="nome"
          />
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <VPhoneField
            disabled={isLoading}
            fullWidth
            label="Telefone"
            name="telefone"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Email"
            name="email"
            type="email"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Interesse"
            name="interesse"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Tentativas"
            name="tentativas"
            type="number"
          />
        </Grid>
        <Grid item xs={12}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Observação"
            name="nota"
            multiline
            rows={3}
          />
        </Grid>
      </Grid>
    </VFormContainer>
  );
};
