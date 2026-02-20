import { IProdutoSaldo, ILancamentoFiltros, ILancamentoPage } from '../entities/IProduto';

export default interface ProdutoRepository {
  findAll(empresa: number): Promise<IProdutoSaldo[]>;
  getById(id: number): Promise<IProdutoSaldo | null>;
  findLancamentos(filtros: ILancamentoFiltros): Promise<ILancamentoPage>;
}
