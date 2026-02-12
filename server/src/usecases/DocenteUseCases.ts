import { IDocente, IDocenteForm } from '../entities/IDocente';
import DocenteRepository from '../repositories/DocenteRepository';
import { AppError } from '../utils/AppError';

export class DocenteUseCases {
  constructor(private repository: DocenteRepository) {}

  async find(ativo: number = 1): Promise<IDocente[]> {
    return this.repository.find(ativo);
  }

  async getById(id: number): Promise<IDocente> {
    const result = await this.repository.getById(id);
    if (!result) {
      throw new AppError('Docente não encontrado', 404);
    }
    return result;
  }

  async create(data: IDocenteForm): Promise<number> {
    if (!data.login) {
      throw new AppError('Login é obrigatório', 400);
    }
    if (!data.nome) {
      throw new AppError('Nome é obrigatório', 400);
    }
    return this.repository.create(data);
  }

  async update(id: number, data: Partial<IDocenteForm>): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Docente não encontrado', 404);
    }
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Docente não encontrado', 404);
    }
    return this.repository.delete(id);
  }
}
