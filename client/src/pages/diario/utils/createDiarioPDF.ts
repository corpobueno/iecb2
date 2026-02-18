import { IDiarioAula, IDiarioFilters } from '../../../entities/Iecb';
import { toCash } from '../../../utils/functions';
import jsPDF from 'jspdf';

export async function createDiarioPDF(filters: IDiarioFilters, aulas: IDiarioAula[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  let rateioGeral = 0;

  const calculateRateioAluno = (aula: IDiarioAula, aluno: IDiarioAula['alunos'][0]) => {
    if (aluno.status !== 1) return 0;

    if (aula.rateioModelo && aluno.tipo === 2) {
      return aluno.valor;
    } else if (aluno.tipo === 1) {
      const rateioPercent = aula.count > 3 ? (aula.rateioRegular || aula.rateio) : aula.rateio;
      return (aluno.valor * rateioPercent) / 100;
    }
    return 0;
  };

  const calculateRateioAula = (aula: IDiarioAula) => {
    let total = 0;
    for (const aluno of aula.alunos) {
      total += calculateRateioAluno(aula, aluno);
    }
    rateioGeral += total;
    return total;
  };

  const formatDate = (dateStr: string) => {
    return dateStr.split('-').reverse().join('/');
  };

  const checkPageBreak = (requiredHeight: number) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + requiredHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Title
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(`Relatório por período: ${formatDate(filters.dataInicio)} à ${formatDate(filters.dataFim)}`, margin, y);
  y += 6;
  doc.text('Unidade: IECB', margin, y);
  y += 10;

  // Process each aula
  for (const aula of aulas) {
    const alunosParaRelatorio = aula.alunos.filter(
      (aluno) => aluno.status === 1 && (aluno.tipo === 1 || (aula.rateioModelo && aluno.tipo === 2))
    );

    if (alunosParaRelatorio.length === 0) continue;

    // Estimate height needed for this section
    const sectionHeight = 30 + (alunosParaRelatorio.length + 2) * 7;
    checkPageBreak(sectionHeight);

    // Aula header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`${aula.nomeDocente} - ${aula.nomeCurso}`, margin, y);
    y += 8;

    // Table header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const colWidths = [10, 80, 35, 35, 25];
    const headers = ['', 'Nome', 'Valor', 'Rateio', 'Status'];

    // Draw header background
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 4, contentWidth, 7, 'F');

    let x = margin;
    headers.forEach((header, i) => {
      doc.text(header, x + 2, y);
      x += colWidths[i];
    });
    y += 7;

    // Draw header line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y - 3, margin + contentWidth, y - 3);

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    for (const aluno of alunosParaRelatorio) {
      checkPageBreak(8);

      const rateio = calculateRateioAluno(aula, aluno);
      x = margin;

      // Type column
      doc.text(aluno.tipo === 1 ? 'A' : 'M', x + 2, y);
      x += colWidths[0];

      // Name column (truncate if too long)
      const nome = aluno.nomeAluno.length > 35 ? aluno.nomeAluno.substring(0, 32) + '...' : aluno.nomeAluno;
      doc.text(nome, x + 2, y);
      x += colWidths[1];

      // Value column
      doc.text(toCash(aluno.valor), x + 2, y);
      x += colWidths[2];

      // Rateio column
      doc.text(toCash(rateio), x + 2, y);
      x += colWidths[3];

      // Status column
      doc.setFont('helvetica', 'italic');
      doc.text(aluno.status ? 'Pago' : 'Pendente', x + 2, y);
      doc.setFont('helvetica', 'normal');

      y += 6;

      // Draw light line
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y - 2, margin + contentWidth, y - 2);
    }

    // Total row
    const totalRateioAula = calculateRateioAula(aula);
    checkPageBreak(10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    x = margin + colWidths[0];
    doc.text('Total', x + 2, y);
    x += colWidths[1] + colWidths[2];
    doc.text(toCash(totalRateioAula), x + 2, y);

    y += 12;
  }

  // Total geral
  checkPageBreak(20);
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Total Rateio:', margin, y);
  doc.text(toCash(rateioGeral), margin + 40, y);

  // Open PDF
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}
