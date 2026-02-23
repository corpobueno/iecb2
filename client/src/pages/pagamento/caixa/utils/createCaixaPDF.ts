import jsPDF from 'jspdf';
import { ICaixaPagamentoResult, IPagamentoDetalhe } from '../../../../entities/Iecb';
import { toCash } from '../../../../utils/functions';
import { IPagamentoCaixaFiltros } from '../components/PagamentoCaixaFiltros';
import { PagamentoService } from '../../../../api/services/PagamentoService';

interface ParcelaAgrupada {
  parcelas: number;
  total: number;
  count: number;
}

export async function createCaixaPDF(filters: IPagamentoCaixaFiltros, caixaData: ICaixaPagamentoResult) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const formatDateStr = (dateStr: string) => {
    return dateStr.split('-').reverse().join('/');
  };

  const checkPageBreak = (requiredHeight: number) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + requiredHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Agrupar detalhes por parcelas
  const agruparPorParcelas = (detalhes: IPagamentoDetalhe[]): ParcelaAgrupada[] => {
    const grupos = new Map<number, { total: number; count: number }>();

    for (const pg of detalhes) {
      const parcelas = pg.qnt || 1;
      const grupo = grupos.get(parcelas) || { total: 0, count: 0 };
      grupo.total += Number(pg.valor);
      grupo.count += 1;
      grupos.set(parcelas, grupo);
    }

    return Array.from(grupos.entries())
      .map(([parcelas, dados]) => ({ parcelas, ...dados }))
      .sort((a, b) => a.parcelas - b.parcelas);
  };

  // Buscar detalhes de todas as formas de pagamento
  const detalhesMap = new Map<number, IPagamentoDetalhe[]>();

  for (const forma of [...caixaData.pagamentos, ...caixaData.bonificacoes]) {
    const result = await PagamentoService.getCaixaDetalhes({
      ...filters,
      idPagamento: forma.idPagamento,
    });
    if (!(result instanceof Error)) {
      detalhesMap.set(forma.idPagamento, result);
    }
  }

  // Título
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Caixa', margin, y);
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${formatDateStr(filters.data_inicio)} a ${formatDateStr(filters.data_fim)}`, margin, y);
  y += 12;

  // Resumo Geral
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 4, contentWidth, 30, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');

  const totalGeral = caixaData.sumPagamentos + caixaData.sumBonificacoes;
  const hasBonificacoes = caixaData.sumBonificacoes > 0;

  const colWidth = hasBonificacoes ? contentWidth / 3 : contentWidth / 2;

  // Pagamentos
  doc.text('Pagamentos', margin + colWidth / 2, y + 4, { align: 'center' });
  doc.setFontSize(14);
  doc.text(toCash(caixaData.sumPagamentos), margin + colWidth / 2, y + 12, { align: 'center' });

  // Bonificações
  if (hasBonificacoes) {
    doc.setFontSize(11);
    doc.text('Bonificações', margin + colWidth + colWidth / 2, y + 4, { align: 'center' });
    doc.setFontSize(14);
    doc.text(toCash(caixaData.sumBonificacoes), margin + colWidth + colWidth / 2, y + 12, { align: 'center' });
  }

  // Total Geral
  const totalX = hasBonificacoes ? margin + 2 * colWidth + colWidth / 2 : margin + colWidth + colWidth / 2;
  doc.setFontSize(11);
  doc.text('Total Geral', totalX, y + 4, { align: 'center' });
  doc.setFontSize(14);
  doc.text(toCash(totalGeral), totalX, y + 12, { align: 'center' });

  y += 35;

  // Seção de Pagamentos
  if (caixaData.pagamentos.length > 0) {
    checkPageBreak(20);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Pagamentos por Forma', margin, y);
    y += 10;

    for (const forma of caixaData.pagamentos) {
      const detalhes = detalhesMap.get(forma.idPagamento) || [];
      const agrupados = agruparPorParcelas(detalhes);

      // Calcular altura necessária
      const alturaSecao = 10 + (agrupados.length * 6);
      checkPageBreak(alturaSecao);

      // Nome da forma de pagamento
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${forma.nome}:`, margin, y);
      y += 6;

      // Listar parcelas agrupadas
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      for (const grupo of agrupados) {
        const label = grupo.parcelas === 1 ? 'À vista' : `${grupo.parcelas}x`;
        doc.text(`${label}:`, margin + 5, y);
        doc.text(toCash(grupo.total), margin + 35, y);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(`(${grupo.count} ${grupo.count === 1 ? 'lançamento' : 'lançamentos'})`, margin + 70, y);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        y += 5;
      }

      y += 5;
    }

    // Total
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total Pagamentos:', margin, y);
    doc.text(toCash(caixaData.sumPagamentos), margin + 50, y);
    y += 12;
  }

  // Seção de Bonificações
  if (caixaData.bonificacoes.length > 0) {
    checkPageBreak(20);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Bonificações por Tipo', margin, y);
    y += 10;

    for (const forma of caixaData.bonificacoes) {
      const detalhes = detalhesMap.get(forma.idPagamento) || [];

      checkPageBreak(12);

      // Nome do tipo de bonificação
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${forma.nome}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(toCash(forma.total), margin + 50, y);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`(${detalhes.length} ${detalhes.length === 1 ? 'lançamento' : 'lançamentos'})`, margin + 85, y);
      doc.setTextColor(0, 0, 0);
      y += 8;
    }

    // Total
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total Bonificações:', margin, y);
    doc.text(toCash(caixaData.sumBonificacoes), margin + 50, y);
  }

  // Abrir PDF
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}
