import db from '../db';
import { IPagamento, IPagamentoForm, ICaixaPagamentoFiltros, ICaixaPagamentoResult, ICaixaFiltrosOptions, IFormaPagamentoAgrupado, ICaixaDetalhesFiltros, IPagamentoDetalhe } from '../entities/IPagamento';
import PagamentoRepository from '../repositories/PagamentoRepository';

const FORMAS_PAGAMENTO: Record<number, string> = {

  1: 'Débito',
  2: 'Dinheiro',
  3: 'Cheque',
  4: 'Crédito',
  6: 'Bonificação',
  9: 'Promissória',
  11: 'Pago pelo link',
  17: 'Pix',
  16: 'Crédito Cliente',
};

export class PagamentoRepositoryImpl implements PagamentoRepository {
  private readonly tableName = 'pagamento_iecb';

  async findByCliente(idCliente: number, ativo: number): Promise<IPagamento[]> {
    return db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'acompanhamento_iecb.nome as nomeCliente',
        'cursos_iecb.nome as nomeCurso'
      )
      .leftJoin('acompanhamento_iecb', `${this.tableName}.id_cliente`, 'acompanhamento_iecb.id')
      .leftJoin('aulas_iecb', `${this.tableName}.id_aula`, 'aulas_iecb.id')
      .leftJoin('cursos_iecb', 'aulas_iecb.id_curso', 'cursos_iecb.id')
      .where(`${this.tableName}.id_cliente`, idCliente)
      .where(`${this.tableName}.ativo`, ativo)
      .orderBy(`${this.tableName}.data`, 'desc');
  }

  async findByAula(idAula: number, ativo: number): Promise<IPagamento[]> {
    return db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'acompanhamento_iecb.nome as nomeCliente',
        'cursos_iecb.nome as nomeCurso'
      )
      .leftJoin('acompanhamento_iecb', `${this.tableName}.id_cliente`, 'acompanhamento_iecb.id')
      .leftJoin('aulas_iecb', `${this.tableName}.id_aula`, 'aulas_iecb.id')
      .leftJoin('cursos_iecb', 'aulas_iecb.id_curso', 'cursos_iecb.id')
      .where(`${this.tableName}.id_aula`, idAula)
      .where(`${this.tableName}.ativo`, ativo)
      .orderBy(`${this.tableName}.data`, 'desc');
  }

  async getById(id: number): Promise<IPagamento | null> {
    const result = await db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'acompanhamento_iecb.nome as nomeCliente',
        'cursos_iecb.nome as nomeCurso'
      )
      .leftJoin('acompanhamento_iecb', `${this.tableName}.id_cliente`, 'acompanhamento_iecb.id')
      .leftJoin('aulas_iecb', `${this.tableName}.id_aula`, 'aulas_iecb.id')
      .leftJoin('cursos_iecb', 'aulas_iecb.id_curso', 'cursos_iecb.id')
      .where(`${this.tableName}.id`, id)
      .first();
    return result ?? null;
  }

  async create(data: IPagamentoForm): Promise<number> {
    const [id] = await db(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: Partial<IPagamentoForm>): Promise<void> {
    await db(this.tableName).update(data).where({ id });
  }

  async cancelByaula(idAula: number): Promise<void> {
    await db(this.tableName).update({
      idAula: null,
      idAluno: null,
      docente: null
    })
      .where({ idAula });
  }

  async convertToCredit(id: number): Promise<void> {
    await db(this.tableName).update({
      idAula: null,
      idAluno: null,
      docente: null
    }).where({ id });
  }

  async delete(id: number): Promise<void> {
    await db(this.tableName).update({ ativo: 0 }).where({ id });
  }

  async getCreditosByCliente(idCliente: number): Promise<{ creditos: number }> {
    // Soma de pagamentos com valor positivo que não foram vinculados a aulas
    const result = await db(this.tableName)
      .where({ idCliente, ativo: 1 })
      .whereNull('id_aula')
      .whereNot('id_pagamento', 6)
      .sum('valor as creditos')
      .first();
    return { creditos: Number(result?.creditos || 0) };
  }

  async getCaixaPagamentos(filtros: ICaixaPagamentoFiltros): Promise<ICaixaPagamentoResult> {
    const { data_inicio, data_fim, caixa, docente } = filtros;

    // Query para agrupar pagamentos por idPagamento
    let query = db(this.tableName)
      .select('id_pagamento as idPagamento')
      .sum('valor as total')
      .count('* as count')
      .where('ativo', 1)
      .whereBetween('data', [data_inicio, `${data_fim} 23:59:59`])
      .groupBy('id_pagamento');

    if (caixa) {
      query = query.where('caixa', caixa);
    }

    if (docente) {
      query = query.where('docente', docente);
    }

    const results = await query;

    const pagamentos: IFormaPagamentoAgrupado[] = [];
    const bonificacoes: IFormaPagamentoAgrupado[] = [];
    let sumPagamentos = 0;
    let sumBonificacoes = 0;

    for (const row of results) {
      const idPagamento = Number(row.idPagamento) || 0;
      const item: IFormaPagamentoAgrupado = {
        idPagamento,
        nome: FORMAS_PAGAMENTO[idPagamento] || `Forma ${idPagamento}`,
        total: Number(row.total) || 0,
        count: Number(row.count) || 0,
      };

      // idPagamento = 6 são bonificações
      if (idPagamento === 6) {
        bonificacoes.push(item);
        sumBonificacoes += item.total;
      } else {
        pagamentos.push(item);
        sumPagamentos += item.total;
      }
    }

    return {
      pagamentos,
      bonificacoes,
      sumPagamentos,
      sumBonificacoes,
    };
  }

  async getCaixaFiltrosOptions(filtros: ICaixaPagamentoFiltros): Promise<ICaixaFiltrosOptions> {
    const { data_inicio, data_fim } = filtros;

    // Buscar caixas distintos no período
    const caixasResult = await db(this.tableName)
      .distinct('caixa')
      .where('ativo', 1)
      .whereBetween('data', [data_inicio, `${data_fim} 23:59:59`])
      .whereNotNull('caixa')
      .where('caixa', '!=', '');

    const caixas = caixasResult.map((row: any) => ({
      id: row.caixa,
      label: row.caixa,
    }));

    // Buscar docentes distintos no período
    const docentesResult = await db(this.tableName)
      .distinct('docente')
      .where('ativo', 1)
      .whereBetween('data', [data_inicio, `${data_fim} 23:59:59`])
      .whereNotNull('docente')
      .where('docente', '!=', '');

    const docentes = docentesResult.map((row: any) => ({
      id: row.docente,
      label: row.docente,
    }));

    return { caixas, docentes };
  }

  async getCaixaDetalhes(filtros: ICaixaDetalhesFiltros): Promise<IPagamentoDetalhe[]> {
    const { data_inicio, data_fim, caixa, docente, idPagamento } = filtros;

    let query = db(this.tableName)
      .select(
        `${this.tableName}.id`,
        `${this.tableName}.data`,
        `${this.tableName}.valor`,
        `${this.tableName}.qnt`,
        `${this.tableName}.docente`,
        `${this.tableName}.caixa`,
        'acompanhamento_iecb.nome as nomeCliente',
        'cursos_iecb.nome as nomeCurso'
      )
      .leftJoin('acompanhamento_iecb', `${this.tableName}.id_cliente`, 'acompanhamento_iecb.id')
      .leftJoin('aulas_iecb', `${this.tableName}.id_aula`, 'aulas_iecb.id')
      .leftJoin('cursos_iecb', 'aulas_iecb.id_curso', 'cursos_iecb.id')
      .where(`${this.tableName}.ativo`, 1)
      .where(`${this.tableName}.id_pagamento`, idPagamento)
      .whereBetween(`${this.tableName}.data`, [data_inicio, `${data_fim} 23:59:59`])
      .orderBy(`${this.tableName}.data`, 'desc');

    if (caixa) {
      query = query.where(`${this.tableName}.caixa`, caixa);
    }

    if (docente) {
      query = query.where(`${this.tableName}.docente`, docente);
    }

    return query;
  }
}
