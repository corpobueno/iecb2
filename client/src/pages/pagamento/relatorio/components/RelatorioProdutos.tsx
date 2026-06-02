import { useState } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Table, TableBody,
  TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { IRelatorioVendasProduto } from '../../../../entities/Iecb';
import { toCash } from '../../../../utils/functions';

interface Props {
  produtos: IRelatorioVendasProduto[];
  total: number;
}

export const RelatorioProdutos: React.FC<Props> = ({ produtos, total }) => {
  const [expanded, setExpanded] = useState(false);

  if (produtos.length === 0) return null;

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExp) => setExpanded(isExp)}
      elevation={0}
      variant="outlined"
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} flex={1}>
          <Inventory2Icon color="secondary" />
          <Typography variant="subtitle1" fontWeight="bold">
            Produtos
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {produtos.length} {produtos.length === 1 ? 'item' : 'itens'}
          </Typography>
        </Box>
        <Typography variant="subtitle1" fontWeight="bold" color="secondary">
          {toCash(total)}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell align="right">Vendas</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {produtos.map((p) => (
              <TableRow key={p.idProduto || p.nomeProduto}>
                <TableCell>{p.nomeProduto}</TableCell>
                <TableCell align="right">{p.qntVendas}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight={500}>{toCash(p.total)}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AccordionDetails>
    </Accordion>
  );
};
