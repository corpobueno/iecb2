import { ICurso, ICursoForm } from '../entities/ICurso';
import CursoRepository from '../repositories/CursoRepository';
import { AppError } from '../utils/AppError';

export class CursoUseCases {
  constructor(private repository: CursoRepository) {}

  async find(ativo: number = 1): Promise<ICurso[]> {
    return this.repository.find(ativo);
  }

  async getById(id: number): Promise<ICurso> {
    const result = await this.repository.getById(id);
    if (!result) {
      throw new AppError('Curso não encontrado', 404);
    }
    return result;
  }

  async create(data: ICursoForm): Promise<number> {
    if (!data.nome) {
      throw new AppError('Nome é obrigatório', 400);
    }
    return this.repository.create(data);
  }

  async update(id: number, data: Partial<ICursoForm>): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Curso não encontrado', 404);
    }
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Curso não encontrado', 404);
    }
    return this.repository.delete(id);
  }
}
