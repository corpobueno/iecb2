import { IAcompanhamento, IAcompanhamentoForm } from '../entities/IAcompanhamento';
import AcompanhamentoRepository from '../repositories/AcompanhamentoRepository';
import { AppError } from '../utils/AppError';
import { sanitizeEmptyToNull } from '../utils/sanitizeData';

export class AcompanhamentoUseCases {
  constructor(private repository: AcompanhamentoRepository) {}

  async find(page: number, limit: number, filter: string): Promise<{ data: IAcompanhamento[]; totalCount: number }> {
    return this.repository.find(page, limit, filter);
  }

  async getById(id: number): Promise<IAcompanhamento> {
    const result = await this.repository.getById(id);
    if (!result) {
      throw new AppError('Acompanhamento não encontrado', 404);
    }
    return result;
  }

  async create(data: IAcompanhamentoForm): Promise<number> {
    if (!data.nome) {
      throw new AppError('Nome é obrigatório', 400);
    }
    if (!data.telefone) {
      throw new AppError('Telefone é obrigatório', 400);
    }
    const sanitizedData = sanitizeEmptyToNull(data);
    return this.repository.create(sanitizedData);
  }

  async update(id: number, data: Partial<IAcompanhamentoForm>): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Acompanhamento não encontrado', 404);
    }
    const sanitizedData = sanitizeEmptyToNull(data);
    return this.repository.update(id, sanitizedData);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Acompanhamento não encontrado', 404);
    }
    return this.repository.delete(id);
  }
}
