import db from '../db';
import { ICurso, ICursoForm } from '../entities/ICurso';
import CursoRepository from '../repositories/CursoRepository';

export class CursoRepositoryImpl implements CursoRepository {
  private readonly tableName = 'cursos_iecb';

  async find(ativo: number): Promise<ICurso[]> {
    return db(this.tableName)
      .where('ativo', ativo)
      .orderBy('nome', 'asc');
  }

  async getById(id: number): Promise<ICurso | null> {
    const result = await db(this.tableName).where({ id }).first();
    return result ?? null;
  }

  async create(data: ICursoForm): Promise<number> {
    const [id] = await db(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: Partial<ICursoForm>): Promise<void> {
    await db(this.tableName).update(data).where({ id });
  }

  async delete(id: number): Promise<void> {
    await db(this.tableName).update({ ativo: 0 }).where({ id });
  }
}
