import db from '../db';
import { IPagamento, IPagamentoForm, ICaixaPagamentoFiltros, ICaixaPagamentoResult, ICaixaFiltrosOptions, IFormaPagamentoAgrupado, ICaixaDetalhesFiltros, IPagamentoDetalhe, IRelatorioVendasFiltros, IRelatorioVendasResult, IRelatorioVendasCategoria, IRelatorioVendasCurso, IRelatorioVendasProduto } from '../entities/IPagamento';
import PagamentoRepository from '../repositories/PagamentoRepository';

const FORMAS_PAGAMENTO: Record<number, string> = {
  0: 'Bonificação',
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

  async findByCliente(idCliente: number, ref = 'id_cliente'): Promise<IPagamento[]> {
    return db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'acompanhamento_iecb.nome as nomeCliente',
        'cursos_iecb.nome as nomeCurso'
      )
      .leftJoin('acompanhamento_iecb', `${this.tableName}.id_cliente`, 'acompanhamento_iecb.id')
      .leftJoin('aulas_iecb', `${this.tableName}.id_aula`, 'aulas_iecb.id')
      .leftJoin('cursos_iecb', 'aulas_iecb.id_curso', 'cursos_iecb.id')
      .where(`${this.tableName}.${ref}`, idCliente)
      .where(`${this.tableName}.ativo`, 1)
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
    const pagamentos = await db(this.tableName)
      .select('id_cliente as idCliente', 'valor', 'caixa')
      .where({ id_aula: idAula, ativo: 1 });

    for (const pagamento of pagamentos) {
      await db(this.tableName).insert({
        id_cliente: pagamento.idCliente,
        valor: pagamento.valor,
        caixa: pagamento.caixa,
        id_pagamento: 16
      });
    }
  }

  async convertToCredit(id: number): Promise<void> {
    const pagamento = await db(this.tableName)
      .select('id_cliente as idCliente', 'valor', 'caixa')
      .where({ id })
      .first();

    if (pagamento) {
      await db(this.tableName).insert({
        id_cliente: pagamento.idCliente,
        valor: pagamento.valor,
        caixa: pagamento.caixa,
        id_pagamento: 16
      });
    }
  }

  async delete(id: number): Promise<void> {
    await db(this.tableName).update({ ativo: 0 }).where({ id });
  }

  async getCreditosByCliente(idCliente: number): Promise<{ creditos: number }> {
    // Soma de pagamentos com valor positivo que não foram vinculados a aulas
    const result = await db(this.tableName)
      .where({ idCliente, ativo: 1 })
      .whereNull('id_aula')
      .where('id_pagamento', 16)
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
      .whereNotIn('id_pagamento', [0, 6, 16])
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

  async getRelatorioVendas(filtros: IRelatorioVendasFiltros): Promise<IRelatorioVendasResult> {
    const { data_inicio, data_fim, caixa, docente } = filtros;
    const dataFimFull = `${data_fim} 23:59:59`;

    // ----- CURSOS: pagamento -> aula -> curso -> categoria
    let cursosQuery = db(this.tableName)
      .select(
        'cursos_iecb.id as idCurso',
        'cursos_iecb.nome as nomeCurso',
        'categoria_cursos.id as idCategoria',
        'categoria_cursos.nome as nomeCategoria',
      )
      .sum({ total: db.raw('?? + COALESCE(??, 0)', [`${this.tableName}.valor`, `${this.tableName}.valor_matricula`]) })
      .count({ qntPagamentos: `${this.tableName}.id` })
      .countDistinct({ qntAlunos: `${this.tableName}.id_aluno` })
      .innerJoin('aulas_iecb', `${this.tableName}.id_aula`, 'aulas_iecb.id')
      .innerJoin('cursos_iecb', 'aulas_iecb.id_curso', 'cursos_iecb.id')
      .leftJoin('categoria_cursos', 'cursos_iecb.categoria', 'categoria_cursos.id')
      .where(`${this.tableName}.ativo`, 1)
      .whereNotIn(`${this.tableName}.id_pagamento`, [0, 6, 16])
      .whereNotNull(`${this.tableName}.id_aula`)
      .whereBetween(`${this.tableName}.data`, [data_inicio, dataFimFull])
      .groupBy('categoria_cursos.id', 'categoria_cursos.nome', 'cursos_iecb.id', 'cursos_iecb.nome')
      .orderBy([
        { column: 'categoria_cursos.nome', order: 'asc' },
        { column: 'cursos_iecb.nome', order: 'asc' },
      ]);

    if (caixa) cursosQuery = cursosQuery.where(`${this.tableName}.caixa`, caixa);
    if (docente) cursosQuery = cursosQuery.where(`${this.tableName}.docente`, docente);

    // ----- PRODUTOS: pagamento -> lancamentos -> pacotes_servico
    let produtosQuery = db(this.tableName)
      .select(
        'pacotes_servico.id as idProduto',
        'pacotes_servico.nome as nomeProduto',
      )
      .sum({ total: `${this.tableName}.valor` })
      .count({ qntVendas: `${this.tableName}.id` })
      .innerJoin('lancamentos_iecb', `${this.tableName}.id_lancamentos`, 'lancamentos_iecb.id')
      .leftJoin('pacotes_servico', 'lancamentos_iecb.produto', 'pacotes_servico.id')
      .where(`${this.tableName}.ativo`, 1)
      .whereNotIn(`${this.tableName}.id_pagamento`, [0, 6, 16])
      .whereNull(`${this.tableName}.id_aula`)
      .whereBetween(`${this.tableName}.data`, [data_inicio, dataFimFull])
      .groupBy('pacotes_servico.id', 'pacotes_servico.nome')
      .orderBy('pacotes_servico.nome', 'asc');

    if (caixa) produtosQuery = produtosQuery.where(`${this.tableName}.caixa`, caixa);
    if (docente) produtosQuery = produtosQuery.where(`${this.tableName}.docente`, docente);

    const [cursosRows, produtosRows] = await Promise.all([cursosQuery, produtosQuery]);

    // Agrupa cursos por categoria em memória
    const categoriaMap = new Map<number, IRelatorioVendasCategoria>();

    for (const row of cursosRows as any[]) {
      const idCategoria = Number(row.idCategoria) || 0;
      const nomeCategoria = row.nomeCategoria || 'Sem categoria';
      const total = Number(row.total) || 0;
      const qntPagamentos = Number(row.qntPagamentos) || 0;
      const qntAlunos = Number(row.qntAlunos) || 0;

      const curso: IRelatorioVendasCurso = {
        idCurso: Number(row.idCurso),
        nomeCurso: row.nomeCurso,
        total,
        qntPagamentos,
        qntAlunos,
      };

      let categoria = categoriaMap.get(idCategoria);
      if (!categoria) {
        categoria = {
          idCategoria,
          nomeCategoria,
          total: 0,
          qntPagamentos: 0,
          qntAlunos: 0,
          cursos: [],
        };
        categoriaMap.set(idCategoria, categoria);
      }

      categoria.cursos.push(curso);
      categoria.total += total;
      categoria.qntPagamentos += qntPagamentos;
      categoria.qntAlunos += qntAlunos;
    }

    const categorias = Array.from(categoriaMap.values()).sort((a, b) => {
      if (a.idCategoria === 0) return 1;
      if (b.idCategoria === 0) return -1;
      return a.nomeCategoria.localeCompare(b.nomeCategoria);
    });

    const produtos: IRelatorioVendasProduto[] = produtosRows.map((row: any) => ({
      idProduto: Number(row.idProduto) || 0,
      nomeProduto: row.nomeProduto || 'Produto avulso',
      total: Number(row.total) || 0,
      qntVendas: Number(row.qntVendas) || 0,
    }));

    const totalCursos = categorias.reduce((sum, c) => sum + c.total, 0);
    const totalProdutos = produtos.reduce((sum, p) => sum + p.total, 0);

    return {
      totalGeral: totalCursos + totalProdutos,
      totalCursos,
      totalProdutos,
      categorias,
      produtos,
    };
  }

  async getCaixaDetalhes(filtros: ICaixaDetalhesFiltros): Promise<IPagamentoDetalhe[]> {
    const { data_inicio, data_fim, caixa, docente, idPagamento } = filtros;

    let query = db(this.tableName)
      .select(
        `${this.tableName}.id`,
        `${this.tableName}.data`,
        `${this.tableName}.valor`,
        `${this.tableName}.qnt`,
        `${this.tableName}.id_cliente as idCliente`,
        `${this.tableName}.id_pagamento as idPagamento`,
        `${this.tableName}.docente`,
        `${this.tableName}.caixa`,
        `${this.tableName}.id_lancamentos as idLancamentos`,
        `${this.tableName}.id_aula as idAula`,
        `${this.tableName}.id_aluno as idAluno`,
        'acompanhamento_iecb.nome as nomeCliente',
        'cursos_iecb.nome as nomeCurso',
        'pacotes_servico.nome as nomeProduto'
      )
      .leftJoin('acompanhamento_iecb', `${this.tableName}.id_cliente`, 'acompanhamento_iecb.id')
      .leftJoin('aulas_iecb', `${this.tableName}.id_aula`, 'aulas_iecb.id')
      .leftJoin('cursos_iecb', 'aulas_iecb.id_curso', 'cursos_iecb.id')
      .leftJoin('lancamentos_iecb', `${this.tableName}.id_lancamentos`, 'lancamentos_iecb.id')
      .leftJoin('pacotes_servico', 'lancamentos_iecb.produto', 'pacotes_servico.id')
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
