import { IDiarioAula, IDiarioFilters } from '../../../entities/Iecb';
import { toCash } from '../../../utils/functions';

export async function createDiarioPDF(filters: IDiarioFilters, aulas: IDiarioAula[]) {
  // Dynamic imports to handle Vite's module system
  const pdfMakeModule = await import('pdfmake/build/pdfmake');
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const pdfFonts = pdfFontsModule.default || pdfFontsModule;

  // Setup vfs fonts
  if (pdfFonts.pdfMake?.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  } else if ((pdfFonts as any).vfs) {
    pdfMake.vfs = (pdfFonts as any).vfs;
  }

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

  const title = [
    {
      table: {
        widths: ['100%'],
        body: [
          [
            {
              text: `Relatório por período: ${formatDate(filters.dataInicio)} à ${formatDate(filters.dataFim)}\nUnidade: IECB`,
              fontSize: 15,
              bold: true,
              margin: [5, 5, 20, 5],
              lineHeight: 0.7,
            },
          ],
        ],
      },
    },
  ];

  const pagamentos = aulas.map((aula) => {
    // Filter only paid students for commission calculation
    const alunosParaRelatorio = aula.alunos.filter(
      (aluno) => aluno.status === 1 && (aluno.tipo === 1 || (aula.rateioModelo && aluno.tipo === 2))
    );

    const resultAula = alunosParaRelatorio.map((aluno) => {
      const rateio = calculateRateioAluno(aula, aluno);

      return [
        {
          text: aluno.tipo === 1 ? 'A' : 'M',
          fontSize: 11,
          margin: [0, 2, 0, 2],
        },
        {
          text: aluno.nomeAluno,
          fontSize: 11,
          margin: [0, 2, 0, 2],
        },
        {
          text: toCash(aluno.valor),
          fontSize: 11,
          margin: [0, 2, 0, 2],
          noWrap: true,
        },
        {
          text: toCash(rateio),
          fontSize: 11,
          margin: [0, 2, 0, 2],
          noWrap: true,
        },
        {
          text: aluno.status ? 'Pago' : 'Pendente',
          italics: true,
          fontSize: 11,
          margin: [0, 2, 0, 2],
          noWrap: true,
        },
      ];
    });

    const totalRateioAula = calculateRateioAula(aula);

    const totalRow = [
      {},
      {
        text: 'Total',
        bold: true,
        fontSize: 13,
        margin: [0, 2, 0, 2],
        noWrap: true,
      },
      {
        text: '',
        bold: true,
        fontSize: 13,
        margin: [0, 2, 0, 2],
        noWrap: true,
      },
      {
        text: toCash(totalRateioAula),
        bold: true,
        fontSize: 13,
        margin: [0, 2, 0, 2],
        noWrap: true,
      },
      {},
    ];

    return [
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                text: `${aula.nomeDocente} - ${aula.nomeCurso}`,
                fontSize: 16,
                margin: [2, 2, 2, 2],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [2, 2, 2, 2],
      },
      {
        table: {
          headerRows: 1,
          widths: [10, 200, 70, 70, 30],
          body: [
            [
              { border: [true, true, true, true], text: '', style: 'tableHeader', fontSize: 13, bold: true },
              { border: [true, true, true, true], text: 'Nome', style: 'tableHeader', fontSize: 13, bold: true },
              { border: [true, true, true, true], text: 'Valor', style: 'tableHeader', fontSize: 13, bold: true },
              { border: [true, true, true, true], text: 'Rateio', style: 'tableHeader', fontSize: 13, bold: true },
              { border: [true, true, true, true], text: '*', style: 'tableHeader', fontSize: 13, bold: true },
            ],
            ...resultAula,
            totalRow,
          ],
        },
        layout: 'lightHorizontalLines',
      },
    ];
  });

  const totalGeral = {
    table: {
      widths: ['auto', 'auto'],
      body: [
        [
          {
            text: 'Total Rateio',
            bold: true,
            fontSize: 15,
            alignment: 'left',
            margin: [0, 5, 0, 5],
            decoration: 'underline',
          },
          {
            text: toCash(rateioGeral),
            bold: true,
            fontSize: 15,
            margin: [0, 5, 0, 5],
            decoration: 'underline',
            noWrap: true,
          },
        ],
      ],
    },
    layout: 'noBorders',
    margin: [0, 10, 0, 0],
  };

  const pdfContent = [...pagamentos.flat(), totalGeral];

  const docDefinitions: any = {
    pageSize: 'A4',
    pageMargins: [15, 15, 15, 15],
    content: [title, ...pdfContent],
    layout: 'lightHorizontalLines',
    pageBreakBefore: function (
      currentNode: any,
      followingNodesOnPage: any[],
    ) {
      return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0;
    },
  };

  pdfMake.createPdf(docDefinitions).open();
}
