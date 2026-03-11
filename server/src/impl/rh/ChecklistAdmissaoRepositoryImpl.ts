import db from '../../db';
import { IChecklistAdmissao, IChecklistAdmissaoForm, IChecklistAdmissaoUpdate, IChecklistStats } from '../../entities/rh';
import ChecklistAdmissaoRepository from '../../repositories/rh/ChecklistAdmissaoRepository';

export class ChecklistAdmissaoRepositoryImpl implements ChecklistAdmissaoRepository {
  private readonly tableName = 'rh_checklist_admissao_iecb';

  async findByColaborador(idColaborador: number): Promise<IChecklistAdmissao[]> {
    return db(this.tableName)
      .where('idColaborador', idColaborador)
      .where('ativo', 1)
      .orderBy('id', 'asc');
  }

  async getById(id: number): Promise<IChecklistAdmissao | null> {
    const result = await db(this.tableName)
      .where({ id })
      .first();
    return result ?? null;
  }

  async create(data: IChecklistAdmissaoForm): Promise<number> {
    const [id] = await db(this.tableName).insert(data);
    return id;
  }

  async createMany(items: IChecklistAdmissaoForm[]): Promise<void> {
    if (items.length === 0) return;
    await db(this.tableName).insert(items);
  }

  async update(id: number, data: IChecklistAdmissaoUpdate): Promise<void> {
    await db(this.tableName)
      .update(data)
      .where({ id });
  }

  async delete(id: number): Promise<void> {
    // Soft delete
    await db(this.tableName)
      .update({ ativo: 0 })
      .where({ id });
  }

  async deleteByColaborador(idColaborador: number): Promise<void> {
    // Soft delete de todos os itens do colaborador
    await db(this.tableName)
      .update({ ativo: 0 })
      .where({ idColaborador });
  }

  async getStats(idColaborador: number): Promise<IChecklistStats> {
    const items = await db(this.tableName)
      .where('idColaborador', idColaborador)
      .where('ativo', 1)
      .select('concluido');

    const total = items.length;
    const concluidos = items.filter(i => i.concluido === 1).length;
    const pendentes = total - concluidos;
    const percentualConcluido = total > 0 ? Math.round((concluidos / total) * 100) : 0;

    return {
      total,
      concluidos,
      pendentes,
      percentualConcluido
    };
  }
}
