import { ICategoriaCurso } from '../entities/ICategoriaCurso';
import CategoriaCursoRepository from '../repositories/CategoriaCursoRepository';
import { AppError } from '../utils/AppError';

export class CategoriaCursoUseCases {
  constructor(private repository: CategoriaCursoRepository) {}

  async find(): Promise<ICategoriaCurso[]> {
    return this.repository.find();
  }

  async getById(id: number): Promise<ICategoriaCurso> {
    const result = await this.repository.getById(id);
    if (!result) {
      throw new AppError('Categoria não encontrada', 404);
    }
    return result;
  }
}
