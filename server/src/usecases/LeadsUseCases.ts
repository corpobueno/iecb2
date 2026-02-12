import { ILeads, ILeadsForm, ILeadsPrincipal, ILeadsFiltros, ILeadsComentarioForm } from '../entities/ILeads';
import LeadsRepository from '../repositories/LeadsRepository';
import { AppError } from '../utils/AppError';

export class LeadsUseCases {
  constructor(private repository: LeadsRepository) {}

  async find(page: number, limit: number, filter: string): Promise<{ data: ILeads[]; totalCount: number }> {
    return this.repository.find(page, limit, filter);
  }

  async findPrincipal(filtros: ILeadsFiltros): Promise<{ data: ILeadsPrincipal[]; totalCount: number }> {
    return this.repository.findPrincipal(filtros);
  }

  async getComentariosByTelefone(telefone: string): Promise<ILeads[]> {
    if (!telefone) {
      throw new AppError('Telefone é obrigatório', 400);
    }
    return this.repository.getComentariosByTelefone(telefone);
  }

  async getById(id: number): Promise<ILeadsPrincipal | null> {
    const result = await this.repository.getById(id);
    if (!result) {
      throw new AppError('Lead não encontrado', 404);
    }
    return result;
  }

  async create(data: ILeadsForm): Promise<number> {
    if (!data.telefone) {
      throw new AppError('Telefone é obrigatório', 400);
    }
    if (!data.nome) {
      throw new AppError('Nome é obrigatório', 400);
    }
    return this.repository.create(data);
  }

  async createComentario(data: ILeadsComentarioForm): Promise<number> {
    if (!data.telefone) {
      throw new AppError('Telefone é obrigatório', 400);
    }
    if (!data.texto) {
      throw new AppError('Texto/comentário é obrigatório', 400);
    }
    if (!data.status) {
      throw new AppError('Status é obrigatório', 400);
    }
    return this.repository.createComentario(data);
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

  async countTentativas(telefone: string): Promise<number> {
    return this.repository.countTentativasByTelefone(telefone);
  }
}
