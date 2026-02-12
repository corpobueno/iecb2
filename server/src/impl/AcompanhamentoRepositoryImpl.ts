import db from '../db';
import { IAcompanhamento, IAcompanhamentoForm } from '../entities/IAcompanhamento';
import AcompanhamentoRepository from '../repositories/AcompanhamentoRepository';

export class AcompanhamentoRepositoryImpl implements AcompanhamentoRepository {
  private readonly tableName = 'acompanhamento_iecb';

  async find(page: number, limit: number, filter: string): Promise<{ data: IAcompanhamento[]; totalCount: number }> {
    const offset = (page - 1) * limit;

    let query = db(this.tableName).where('ativo', 1);

    if (filter) {
      query = query.where((builder) => {
        builder
          .where('nome', 'like', `%${filter}%`)
          .orWhere('telefone', 'like', `%${filter}%`)
          .orWhere('email', 'like', `%${filter}%`);
      });
    }

    const countResult = await query.clone().count('* as totalCount').first();
    const totalCount = Number(countResult?.totalCount || 0);

    const data = await query
      .clone()
      .select('*')
      .orderBy('id', 'desc')
      .limit(limit)
      .offset(offset);

    return { data, totalCount };
  }

  async getById(id: number): Promise<IAcompanhamento | null> {
    const result = await db(this.tableName).where({ id }).first();
    return result ?? null;
  }

  async create(data: IAcompanhamentoForm): Promise<number> {
    const [id] = await db(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: Partial<IAcompanhamentoForm>): Promise<void> {
    await db(this.tableName).update(data).where({ id });
  }

  async delete(id: number): Promise<void> {
    await db(this.tableName).update({ ativo: 0 }).where({ id });
  }
}
