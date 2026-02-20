import db from '../db';
import { IProdutoSaldo, ILancamentoFiltros, ILancamentoPage } from '../entities/IProduto';
import ProdutoRepository from '../repositories/ProdutoRepository';

export class ProdutoRepositoryImpl implements ProdutoRepository {
  private readonly tableName = 'pacotes_servico';
  private readonly lancamentosTable = 'lancamentos_iecb';

  async findAll(_: number): Promise<IProdutoSaldo[]> {
    return db(this.tableName)
      .select('*')
      .where('SP', 'P')
      .orderBy('nome', 'asc');
  }

  async getById(id: number): Promise<IProdutoSaldo | null> {
    const result = await db(this.tableName)
      .select('*')
      .where('id', id)
      .first();
    return result ?? null;
  }

  async findLancamentos(filtros: ILancamentoFiltros): Promise<ILancamentoPage> {
    const { page, limit, filter, usuario } = filtros;
    const offset = (page - 1) * limit;

    let query = db(this.lancamentosTable)
      .leftJoin('acompanhamento_iecb', `${this.lancamentosTable}.id_cliente`, 'acompanhamento_iecb.id')
      .leftJoin('pacotes_servico', `${this.lancamentosTable}.produto`, 'pacotes_servico.id')
      .leftJoin('pagamento_iecb', `${this.lancamentosTable}.id`, 'pagamento_iecb.id_lancamentos');

    // Filtro por nome do cliente ou produto
    if (filter) {
      const filterLike = `%${filter}%`;
      query = query.where(function() {
        this.where('acompanhamento_iecb.nome', 'like', filterLike)
          .orWhere('pacotes_servico.nome', 'like', filterLike);
      });
    }

    // Filtro por usuario (vendedor)
    if (usuario) {
      query = query.where(`${this.lancamentosTable}.usuario`, usuario);
    }

    // Contagem total
    const countResult = await query.clone().countDistinct(`${this.lancamentosTable}.id as totalCount`).first();
    const totalCount = Number(countResult?.totalCount || 0);

    // Dados paginados
    const data = await query
      .clone()
      .select(
        `${this.lancamentosTable}.id`,
        `${this.lancamentosTable}.id_cliente as idCliente`,
        `${this.lancamentosTable}.produto`,
        `${this.lancamentosTable}.usuario`,
        `${this.lancamentosTable}.data`,
        'acompanhamento_iecb.nome as nomeCliente',
        'pacotes_servico.nome as nomeProduto',
        'pagamento_iecb.valor',
        'pagamento_iecb.qnt',
        'pagamento_iecb.id_pagamento as idPagamento'
      )
      .orderBy(`${this.lancamentosTable}.data`, 'desc')
      .limit(limit)
      .offset(offset);

    return { data, totalCount };
  }
}
