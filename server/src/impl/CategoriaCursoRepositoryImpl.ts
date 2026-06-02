import db from '../db';
import { ICategoriaCurso } from '../entities/ICategoriaCurso';
import CategoriaCursoRepository from '../repositories/CategoriaCursoRepository';

export class CategoriaCursoRepositoryImpl implements CategoriaCursoRepository {
  private readonly tableName = 'categoria_cursos';

  async find(): Promise<ICategoriaCurso[]> {
    return db(this.tableName).select('id', 'nome').orderBy('nome', 'asc');
  }

  async getById(id: number): Promise<ICategoriaCurso | null> {
    const result = await db(this.tableName).where({ id }).first();
    return result ?? null;
  }
}
