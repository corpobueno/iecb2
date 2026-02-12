import { useEffect, useState } from 'react';
import { Box, Chip, CircularProgress, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import { CopyToClipboard } from '../../../utils/CopyToClipboard';
import { formatDate, toTel } from '../../../utils/functions';
import { ILeadsPrincipal } from '../../../entities/Iecb';
import { LeadsService } from '../../../api/services/LeadsService';

// Mapeamento de redes
const REDES: Record<number, string> = {
  1: 'Facebook',
  2: 'Instagram',
  3: 'WhatsApp',
  4: 'Google',
  5: 'Indicação',
  6: 'Outros',
};

export const DetalheLead: React.FC<{ id: number }> = ({ id }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lead, setLead] = useState<ILeadsPrincipal>();

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    LeadsService.getLead(Number(id))
      .then((result) => {
        setIsLoading(false);

        if (result instanceof Error) {
          console.error(result.message);
        } else {
          setLead(result);
        }
      });
  }, [id]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (!lead) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="body1">Nenhum lead selecionado</Typography>
      </Box>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        mx: 1,
        maxHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto'
      }}
    >
      <Grid container spacing={3}>
        {/* Cabeçalho com nome e status */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h5">
                {lead.nome || 'Cliente sem nome'}
              </Typography>
              {lead.nome && (
                <CopyToClipboard
                  text={lead.nome}
                  tooltipTitle="Copiar nome"
                  successTooltipTitle="Nome copiado!"
                />
              )}
            </Stack>
            <Box display="flex" gap={1}>
              {lead.selecao && (
                <Chip
                  label={lead.selecao}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              <Chip
                label={lead.ativo === 1 ? 'Ativo' : 'Inativo'}
                size="small"
                color={lead.ativo === 1 ? 'success' : 'default'}
              />
            </Box>
          </Box>
          <Divider />
        </Grid>

        {/* Coluna 1 - Contato */}
        <Grid item xs={12} sm={6}>
          <DetailField
            label="Telefone"
            value={toTel(lead.telefone)}
            copyValue={lead.telefone}
          />

          {lead.email && (
            <DetailField
              label="Email"
              value={lead.email}
              copyValue={lead.email}
            />
          )}

          {lead.mesAniversario && (
            <DetailField
              label="Mês de Aniversário"
              value={lead.mesAniversario}
            />
          )}

          {lead.interesse && (
            <DetailField
              label="Interesse"
              value={lead.interesse}
            />
          )}
        </Grid>

        {/* Coluna 2 - Informações do Sistema */}
        <Grid item xs={12} sm={6}>
          <DetailField
            label="Data de Cadastro"
            value={formatDate(lead.dataCadastro)}
          />

          {lead.dataCarteira && (
            <DetailField
              label="Data Carteira"
              value={formatDate(lead.dataCarteira)}
            />
          )}

          <DetailField
            label="Rede/Origem"
            value={lead.rede ? (REDES[lead.rede] || `Rede ${lead.rede}`) : 'Não informado'}
          />

          <DetailField
            label="Usuário Responsável"
            value={lead.usuario || 'Não atribuído'}
          />

          <DetailField
            label="ID"
            value={String(lead.id)}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

interface DetailFieldProps {
  label: string;
  value: string;
  copyValue?: string;
}

const DetailField: React.FC<DetailFieldProps> = ({ label, value, copyValue }) => {
  return (
    <Box mb={2}>
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
          {value}
        </Typography>
        {copyValue && (
          <CopyToClipboard
            text={copyValue}
            size="small"
            tooltipTitle={`Copiar ${label.toLowerCase()}`}
            successTooltipTitle={`${label} copiado!`}
          />
        )}
      </Box>
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
};
