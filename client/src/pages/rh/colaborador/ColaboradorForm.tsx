import { Grid, MenuItem, Typography, Divider } from '@mui/material';
import { VTextField, VFormContainer, VSelect, VDateField, VCpfField } from '../../../components/forms';
import {
  IColaboradorForm,
  STATUS_COLABORADOR_OPTIONS,
  TIPO_CONTRATO_OPTIONS,
  GENERO_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  EXPERIENCIA_STATUS_OPTIONS,
  ESTADOS_BR
} from '../../../entities/Rh';

interface Props {
  handleSave: (data: IColaboradorForm) => void;
  methods: any;
  isLoading?: boolean;
  project: IColaboradorForm;
  isEdit?: boolean;
}

export const ColaboradorForm = ({ handleSave, isLoading = false, project, methods, isEdit = false }: Props) => {
  return (
    <VFormContainer
      sx={{ maxHeight: 'calc(100vh - 90px)', overflow: 'auto' }}
      methods={methods}
      handleSave={handleSave}
    >
      {/* Dados Pessoais */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
          Dados Pessoais
        </Typography>
        <Divider />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <VTextField
          disabled={isLoading}
          fullWidth
          label="Nome *"
          name="nome"
          defaultValue={project.nome}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <VCpfField
          disabled={isLoading}
          fullWidth
          label="CPF"
          name="cpf"
          defaultValue={project.cpf}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <VTextField
          disabled={isLoading}
          fullWidth
          label="RG"
          name="rg"
          defaultValue={project.rg}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <VDateField
          disabled={isLoading}
          fullWidth
          label="Data de Nascimento"
          name="dataNascimento"
          defaultValue={project.dataNascimento}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <VSelect
          disabled={isLoading}
          fullWidth
          label="Gênero"
          name="genero"
          defaultValue={project.genero || ''}
        >
          <MenuItem value="">Selecione</MenuItem>
          {GENERO_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </VSelect>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <VSelect
          disabled={isLoading}
          fullWidth
          label="Estado Civil"
          name="estadoCivil"
          defaultValue={project.estadoCivil || ''}
        >
          <MenuItem value="">Selecione</MenuItem>
          {ESTADO_CIVIL_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </VSelect>
      </Grid>

      {/* Contato */}
      <Grid item xs={12} sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
          Contato
        </Typography>
        <Divider />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <VTextField
          disabled={isLoading}
          fullWidth
          label="Telefone"
          name="telefone"
          defaultValue={project.telefone}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <VTextField
          disabled={isLoading}
          fullWidth
          label="E-mail"
          name="email"
          type="email"
          defaultValue={project.email}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={5}>
        <VTextField
          disabled={isLoading}
          fullWidth
          label="Endereço"
          name="endereco"
          defaultValue={project.endereco}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <VTextField
          disabled={isLoading}
          fullWidth
          label="Cidade"
          name="cidade"
          defaultValue={project.cidade}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={2}>
        <VSelect
          disabled={isLoading}
          fullWidth
          label="Estado"
          name="estado"
          defaultValue={project.estado || ''}
        >
          <MenuItem value="">UF</MenuItem>
          {ESTADOS_BR.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.value}
            </MenuItem>
          ))}
        </VSelect>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <VTextField
          disabled={isLoading}
          fullWidth
          label="CEP"
          name="cep"
          defaultValue={project.cep}
        />
      </Grid>

      {/* Dados Profissionais */}
      <Grid item xs={12} sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
          Dados Profissionais
        </Typography>
        <Divider />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <VTextField
          disabled={isLoading}
          fullWidth
          label="Cargo"
          name="cargo"
          defaultValue={project.cargo}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <VTextField
          disabled={isLoading}
          fullWidth
          label="Setor"
          name="setor"
          defaultValue={project.setor}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <VSelect
          disabled={isLoading}
          fullWidth
          label="Tipo de Contrato"
          name="tipoContrato"
          defaultValue={project.tipoContrato || 'CLT'}
        >
          {TIPO_CONTRATO_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </VSelect>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <VDateField
          disabled={isLoading}
          fullWidth
          label="Data de Admissão"
          name="dataAdmissao"
          defaultValue={project.dataAdmissao}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <VTextField
          disabled={isLoading}
          fullWidth
          label="Salário"
          name="salario"
          type="number"
          defaultValue={project.salario}
        />
      </Grid>

      {isEdit && (
        <Grid item xs={12} sm={6} md={3}>
          <VSelect
            disabled={isLoading}
            fullWidth
            label="Status"
            name="status"
            defaultValue={project.status || 'ATIVO'}
          >
            {STATUS_COLABORADOR_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </VSelect>
        </Grid>
      )}

      {/* Período de Experiência */}
      <Grid item xs={12} sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
          Período de Experiência
        </Typography>
        <Divider />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <VDateField
          disabled={isLoading}
          fullWidth
          label="Início da Experiência"
          name="experienciaInicio"
          defaultValue={project.experienciaInicio}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <VDateField
          disabled={isLoading}
          fullWidth
          label="Fim da Experiência"
          name="experienciaFim"
          defaultValue={project.experienciaFim}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <VSelect
          disabled={isLoading}
          fullWidth
          label="Status da Experiência"
          name="experienciaStatus"
          defaultValue={project.experienciaStatus || 'PENDENTE'}
        >
          {EXPERIENCIA_STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </VSelect>
      </Grid>
    </VFormContainer>
  );
};
