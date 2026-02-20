export interface IPagamentoForm {
  idCliente: number;
  idAula?: number;
  idAluno?: number;
  idLancamentos?: number;
  idProduto?: number;
  docente?: string;
  caixa: string;
  valor: number;
  valorMatricula?: number;
  idPagamento?: number;
  qnt?: number;
}

export interface IPagamento extends IPagamentoForm {
  id: number;
  data: Date;
  ativo: number;
  // Campos de join
  nomeCliente?: string;
  nomeCurso?: string;
  nomeProduto?: string;
}

export interface IPagamentoPage {
  data: IPagamento[];
  totalCount: number;
}

export interface IPagamentoProcessar {
  idCliente: number;
  idAula: number;
  idAluno: number;
  docente: string;
  caixa: string;
  pagamentos: Array<{
    idPagamento: number;
    valor: number;
    qnt: number;
  }>;
}

// ========================================
// CAIXA DE PAGAMENTOS
// ========================================
export interface ICaixaPagamentoFiltros {
  data_inicio: string;
  data_fim: string;
  caixa?: string;
  docente?: string;
}

export interface IFormaPagamentoAgrupado {
  idPagamento: number;
  nome: string;
  total: number;
  count: number;
}

export interface ICaixaPagamentoResult {
  pagamentos: IFormaPagamentoAgrupado[];
  bonificacoes: IFormaPagamentoAgrupado[];
  sumPagamentos: number;
  sumBonificacoes: number;
}

export interface ICaixaFiltrosOptions {
  caixas: Array<{ id: string; label: string }>;
  docentes: Array<{ id: string; label: string }>;
}

export interface ICaixaDetalhesFiltros extends ICaixaPagamentoFiltros {
  idPagamento: number;
}

export interface IPagamentoDetalhe {
  id: number;
  data: Date;
  valor: number;
  qnt: number;
  nomeCliente: string;
  nomeCurso: string;
  nomeProduto: string;
  docente: string;
  caixa: string;
  idLancamentos: number | null;
  idAula: number | null;
}

// ========================================
// VENDA DE PRODUTOS
// ========================================
export interface IVendaProduto {
  idCliente: number;
  idProduto: number;
  caixa: string;
  pagamentos: Array<{
    idPagamento: number;
    valor: number;
    qnt: number;
  }>;
}

export interface IVendaProdutoFiltros {
  page: number;
  limit: number;
  filter?: string;
  caixa?: string;
}

export interface IVendaProdutoPage {
  data: IPagamento[];
  totalCount: number;
}
