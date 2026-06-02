import { useState } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Table, TableBody,
  TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CategoryIcon from '@mui/icons-material/Category';
import { IRelatorioVendasCategoria } from '../../../../entities/Iecb';
import { toCash } from '../../../../utils/functions';

interface Props {
  categorias: IRelatorioVendasCategoria[];
}

export const RelatorioCategorias: React.FC<Props> = ({ categorias }) => {
  const [expanded, setExpanded] = useState<number | false>(
    categorias.length > 0 ? categorias[0].idCategoria : false
  );

  if (categorias.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">Nenhuma venda de curso no período.</Typography>
      </Box>
    );
  }

  const handleChange = (id: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? id : false);
  };

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {categorias.map((cat) => (
        <Accordion
          key={cat.idCategoria}
          expanded={expanded === cat.idCategoria}
          onChange={handleChange(cat.idCategoria)}
          elevation={0}
          variant="outlined"
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1} flex={1}>
              <CategoryIcon color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">
                {cat.nomeCategoria}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {cat.cursos.length} {cat.cursos.length === 1 ? 'curso' : 'cursos'} ·{' '}
                {cat.qntPagamentos} {cat.qntPagamentos === 1 ? 'pagamento' : 'pagamentos'}
              </Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" color="primary">
              {toCash(cat.total)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Curso</TableCell>
                  <TableCell align="right">Alunos</TableCell>
                  <TableCell align="right">Pagamentos</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cat.cursos.map((curso) => (
                  <TableRow key={curso.idCurso}>
                    <TableCell>{curso.nomeCurso}</TableCell>
                    <TableCell align="right">{curso.qntAlunos}</TableCell>
                    <TableCell align="right">{curso.qntPagamentos}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={500}>{toCash(curso.total)}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};
