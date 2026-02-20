import { Grid } from '@mui/material';
import { VTextField, VFormContainer, VPhoneField } from '../../components/forms';
import { IAcompanhamentoForm } from '../../entities/Iecb';
import { useEffect, useRef } from 'react';

interface Props {
  handleSave: (data: IAcompanhamentoForm) => void;
  methods: any;
  isLoading?: boolean;
  project: IAcompanhamentoForm;
}

export const AcompanhamentoForm = ({ handleSave, isLoading = false, project, methods }: Props) => {
  const lastProjectRef = useRef<string>('');

  useEffect(() => {
    // Só atualiza se o project realmente mudou (para edição)
    const projectKey = JSON.stringify(project);
    if (project && projectKey !== lastProjectRef.current) {
      lastProjectRef.current = projectKey;
      Object.keys(project).forEach((key) => {
        methods.setValue(key, project[key as keyof IAcompanhamentoForm]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

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
            label="Endereço"
            name="endereco"
          />
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Data de Nascimento"
            name="dataNascimento"
            type="date"
            InputLabelProps={{ shrink: true }}
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
