import db from '../db';
import { IDocente, IDocenteForm } from '../entities/IDocente';
import DocenteRepository from '../repositories/DocenteRepository';

export class DocenteRepositoryImpl implements DocenteRepository {
  private readonly tableName = 'docentes';

  async find(ativo: number): Promise<IDocente[]> {
    return db(this.tableName)
      .where('ativo', ativo)
      .orderBy('nome', 'asc');
  }

  async getById(id: number): Promise<IDocente | null> {
    const result = await db(this.tableName).where({ id }).first();
    return result ?? null;
  }

  async create(data: IDocenteForm): Promise<number> {
    const [id] = await db(this.tableName).insert({...data, ativo: 1});
    return id;
  }

  async update(id: number, data: Partial<IDocenteForm>): Promise<void> {
    await db(this.tableName).update(data).where({ id });
  }

  async delete(id: number): Promise<void> {
    await db(this.tableName).update({ ativo: 0 }).where({ id });
  }
}
