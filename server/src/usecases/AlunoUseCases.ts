import { IAluno, IAlunoForm } from '../entities/IAluno';
import AlunoRepository from '../repositories/AlunoRepository';
import { AppError } from '../utils/AppError';

/**
 * Aluno representa a matrícula de um cliente (acompanhamento) em uma aula
 */
export class AlunoUseCases {
  constructor(private repository: AlunoRepository) {}

  async findByAula(idAula: number, ativo: number = 1): Promise<IAluno[]> {
    return this.repository.findByAula(idAula, ativo);
  }

  async findByAulaAndData(idAula: number, data: string): Promise<IAluno[]> {
    return this.repository.findByAulaAndData(idAula, data);
  }

  async getById(id: number): Promise<IAluno> {
    const result = await this.repository.getById(id);
    if (!result) {
      throw new AppError('Matrícula não encontrada', 404);
    }
    return result;
  }

  async create(data: IAlunoForm): Promise<number> {
    if (!data.idAluno) {
      throw new AppError('Cliente é obrigatório', 400);
    }
    if (!data.idAula) {
      throw new AppError('Aula é obrigatória', 400);
    }
    return this.repository.create(data);
  }

  async update(id: number, data: Partial<IAlunoForm>): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Matrícula não encontrada', 404);
    }
    return this.repository.update(id, data);
  }

  async updateStatus(id: number, status: number): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Matrícula não encontrada', 404);
    }
    return this.repository.updateStatus(id, status);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Matrícula não encontrada', 404);
    }
    return this.repository.delete(id);
  }

  async sumValorByAula(idAula: number): Promise<number> {
    return this.repository.sumValorByAula(idAula);
  }
}
