export interface IProduto {
  id: number;
  nome: string;
  preco_venda: number;
  empresa: number;
  active: number;
  categoria?: string;
}

export interface IProdutoSaldo extends IProduto {
  saldo: number;
  custo: number;
  total_saida: number;
}

// ========================================
// LANÇAMENTOS (Vendas de Produtos)
// ========================================
export interface ILancamento {
  id: number;
  idCliente: number;
  produto: number;
  usuario: string;
  data: Date;
  // Campos de join
  nomeCliente?: string;
  nomeProduto?: string;
  // Campos de pagamento vinculado
  valor?: number;
  qnt?: number;
  idPagamento?: number;
}

export interface ILancamentoFiltros {
  page: number;
  limit: number;
  filter?: string;
  usuario?: string;
}

export interface ILancamentoPage {
  data: ILancamento[];
  totalCount: number;
}

// ========================================
// VENDA DE PRODUTO (Form de entrada)
// ========================================
export interface IVendaProdutoForm {
  idCliente: number;
  idProduto: number;
  usuario?: string;
  caixa?: string;
  pagamentos: {
    idPagamento: number;
    valor: number;
    qnt: number;
  }[];
}
