import db from '../db';
import { ILeadsFranqueadoraComentario, ILeadsFranqueadoraForm, ILeadsFranqueadora, ILeadsFranqueadoraFiltros, ILeadsFranqueadoraComentarioForm } from '../entities/ILeadsFranqueadora';
import LeadsFranqueadoraRepository from '../repositories/LeadsFranqueadoraRepository';

export class LeadsFranqueadoraRepositoryImpl implements LeadsFranqueadoraRepository {
  private readonly tableName = 'leads_franquiados';
  private readonly comentariosTable = 'leads_tentativas';

  async findPrincipal(filtros: ILeadsFranqueadoraFiltros): Promise<{ data: ILeadsFranqueadora[]; totalCount: number }> {
    const { page, limit = 20, filter, dataInicio, dataFim, status, user } = filtros;
    const offset = (page - 1) * limit;

    let query = db(this.tableName)
      .select('*');

    if (filter) {
      query = query.where((builder) => {
        builder
          .where('telefone', 'like', `%${filter}%`)
          .orWhere('nome', 'like', `%${filter}%`)
          .orWhere('email', 'like', `%${filter}%`);
      });
    }

    if (dataInicio && dataFim) {
      query = query.whereBetween('data_cadastro', [dataInicio, `${dataFim} 23:59:59`]);
    }

    if (status) {
      query = query.where('status', status);
    }

    if (user && status !== 'nao') {
      query = query.where('user', user);
    }

    const countResult = await query.clone().count('* as totalCount').first();
    const totalCount = Number(countResult?.totalCount || 0);

    const rows = await query
      .clone()
      .orderBy('data_cadastro', 'desc')
      .limit(limit)
      .offset(offset);

    return { data: rows as ILeadsFranqueadora[], totalCount };
  }

  async getById(id: number): Promise<ILeadsFranqueadora | null> {
    const result = await db(this.tableName)
      .select('*')
      .where('id', id)
      .first();

    return result as ILeadsFranqueadora | null;
  }

  async create(data: ILeadsFranqueadoraForm): Promise<number> {
    const dbData = {
      ...data,
      dataCadastro: db.fn.now(),
    };
    const [id] = await db(this.tableName).insert(dbData);
    return id;
  }

  async update(id: number, data: Partial<ILeadsFranqueadoraForm>): Promise<void> {
    await db(this.tableName).update(data).where('id', id);
  }

  async delete(id: number): Promise<void> {
    await db(this.tableName).update({ ativo: 0 }).where('id', id);
  }

  // ========================================
  // MÉTODOS PARA COMENTÁRIOS
  // ========================================

  async getComentariosByTelefone(telefone: string): Promise<ILeadsFranqueadoraComentario[]> {
    try {
      const rows = await db(this.comentariosTable)
        .where('telefone', telefone)
        .orderBy('data', 'desc');

      return rows as ILeadsFranqueadoraComentario[];
    } catch (error) {
      console.warn('Tabela de comentários não encontrada ou erro:', error);
      return [];
    }
  }

  async createComentario(data: ILeadsFranqueadoraComentarioForm): Promise<number> {
    try {
      const dbData = {
        ...data,
        data: db.fn.now(),
      };
      const [id] = await db(this.comentariosTable).insert(dbData);
      return id;
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      throw error;
    }
  }

  // ========================================
  // MÉTODOS LEGADOS (para compatibilidade)
  // ========================================

  async find(page: number, limit: number, filter: string): Promise<{ data: ILeadsFranqueadora[]; totalCount: number }> {
    return this.findPrincipal({ page, limit, filter });
  }

  async countTentativasByTelefone(telefone: string): Promise<number> {
    const result = await db(this.comentariosTable)
      .where({ telefone })
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }
}
