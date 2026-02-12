import { ILeads, ILeadsForm } from '../entities/ILeads';
import LeadsRepository from '../repositories/LeadsRepository';
import { AppError } from '../utils/AppError';

export class LeadsUseCases {
  constructor(private repository: LeadsRepository) {}

  async find(page: number, limit: number, filter: string): Promise<{ data: ILeads[]; totalCount: number }> {
    return this.repository.find(page, limit, filter);
  }

  async getById(id: number): Promise<ILeads> {
    const result = await this.repository.getById(id);
    if (!result) {
      throw new AppError('Lead não encontrado', 404);
    }
    return result;
  }

  async create(data: ILeadsForm): Promise<number> {
    if (!data.nome) {
      throw new AppError('Nome é obrigatório', 400);
    }
    return this.repository.create(data);
  }

  async update(id: number, data: Partial<ILeadsForm>): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Lead não encontrado', 404);
    }
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Lead não encontrado', 404);
    }
    return this.repository.delete(id);
  }
}
