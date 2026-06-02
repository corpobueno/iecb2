import { useEffect, useState } from 'react';
import { Grid, MenuItem } from '@mui/material';
import { VTextField, VFormContainer, VSelect } from '../../components/forms';
import { ICursoForm, ICategoriaCurso } from '../../entities/Iecb';
import { CategoriaCursoService } from '../../api/services/CategoriaCursoService';

interface Props {
  handleSave: (data: ICursoForm) => void;
  methods: any;
  isLoading?: boolean;
  project: ICursoForm;
}

export const CursoForm = ({ handleSave, isLoading = false, project, methods }: Props) => {
  const [categorias, setCategorias] = useState<ICategoriaCurso[]>([]);

  useEffect(() => {
    CategoriaCursoService.find().then((resp) => {
      if (!(resp instanceof Error)) setCategorias(resp);
    });
  }, []);

  return (
    <VFormContainer sx={{ maxHeight: 'calc(100vh - 90px)', overflow: 'auto' }} methods={methods} handleSave={handleSave}>
      <Grid container item direction="row" spacing={2}>
        <Grid item xs={12} sm={8} md={6}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Nome"
            name="nome"
            defaultValue={project.nome}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <VSelect
            disabled={isLoading || categorias.length === 0}
            fullWidth
            label="Categoria"
            name="categoria"
            defaultValue={project.categoria ?? ''}
          >
            <MenuItem value="">Sem categoria</MenuItem>
            {categorias.map((cat) => (
              <MenuItem key={cat.id} value={String(cat.id)}>
                {cat.nome}
              </MenuItem>
            ))}
          </VSelect>
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Valor"
            name="valor"
            type="number"
            defaultValue={project.valor}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Duração"
            name="duracao"
            defaultValue={project.duracao}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Quantidade"
            name="qnt"
            type="number"
            defaultValue={project.qnt}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Cor"
            name="color"
            type="color"
            defaultValue={project.color || '#1976d2'}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="VIP"
            name="vip"
            type="number"
            defaultValue={project.vip}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Grupo"
            name="grupo"
            type="number"
            defaultValue={project.grupo}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={3}>
          <VTextField
            disabled={isLoading}
            fullWidth
            label="Rateio Modelo"
            name="rateioModelo"
            type="number"
            defaultValue={project.rateioModelo}
          />
        </Grid>
      </Grid>
    </VFormContainer>
  );
};
