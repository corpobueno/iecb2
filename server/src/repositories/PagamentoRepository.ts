import { IPagamento, IPagamentoForm, ICaixaPagamentoFiltros, ICaixaPagamentoResult, ICaixaFiltrosOptions, ICaixaDetalhesFiltros, IPagamentoDetalhe } from '../entities/IPagamento';

export default interface PagamentoRepository {
  findByCliente(idCliente: number, ativo: number): Promise<IPagamento[]>;
  findByAula(idAula: number, ativo: number): Promise<IPagamento[]>;
  getById(id: number): Promise<IPagamento | null>;
  create(data: IPagamentoForm): Promise<number>;
  update(id: number, data: Partial<IPagamentoForm>): Promise<void>;
  cancelByaula(idAula: number): Promise<void>;
  convertToCredit(id: number): Promise<void>;
  delete(id: number): Promise<void>;
  getCreditosByCliente(idCliente: number): Promise<{ creditos: number }>;
  getCaixaPagamentos(filtros: ICaixaPagamentoFiltros): Promise<ICaixaPagamentoResult>;
  getCaixaFiltrosOptions(filtros: ICaixaPagamentoFiltros): Promise<ICaixaFiltrosOptions>;
  getCaixaDetalhes(filtros: ICaixaDetalhesFiltros): Promise<IPagamentoDetalhe[]>;
}
