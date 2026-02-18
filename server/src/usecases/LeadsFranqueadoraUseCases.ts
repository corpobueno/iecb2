import { ILeadsFranqueadora, ILeadsFranqueadoraForm, ILeadsFranqueadoraComentario, ILeadsFranqueadoraFiltros, ILeadsFranqueadoraComentarioForm } from '../entities/ILeadsFranqueadora';
import LeadsFranqueadoraRepository from '../repositories/LeadsFranqueadoraRepository';
import { AppError } from '../utils/AppError';

export class LeadsFranqueadoraUseCases {
  constructor(private repository: LeadsFranqueadoraRepository) {}

  async find(page: number, limit: number, filter: string): Promise<{ data: ILeadsFranqueadora[]; totalCount: number }> {
    return this.repository.find(page, limit, filter);
  }

  async findPrincipal(filtros: ILeadsFranqueadoraFiltros): Promise<{ data: ILeadsFranqueadora[]; totalCount: number }> {
    return this.repository.findPrincipal(filtros);
  }

  async getComentariosByTelefone(telefone: string): Promise<ILeadsFranqueadoraComentario[]> {
    if (!telefone) {
      throw new AppError('Telefone é obrigatório', 400);
    }
    return this.repository.getComentariosByTelefone(telefone);
  }

  async getById(id: number): Promise<ILeadsFranqueadora | null> {
    const result = await this.repository.getById(id);
    if (!result) {
      throw new AppError('Lead não encontrado', 404);
    }
    return result;
  }

  async create(data: ILeadsFranqueadoraForm): Promise<number> {
    if (!data.telefone) {
      throw new AppError('Telefone é obrigatório', 400);
    }
    if (!data.nome) {
      throw new AppError('Nome é obrigatório', 400);
    }
    return this.repository.create(data);
  }

  async createComentario(data: ILeadsFranqueadoraComentarioForm): Promise<number> {
    const { telefone, nota, status, idLeads } = data;

    if (!telefone) {
      throw new AppError('Telefone é obrigatório', 400);
    }
    if (!nota) {
      throw new AppError('Nota/comentário é obrigatório', 400);
    }
    if (!status) {
      throw new AppError('Status é obrigatório', 400);
    }

    await this.repository.update(idLeads, { status });

    return this.repository.createComentario(data);
  }

  async update(id: number, data: Partial<ILeadsFranqueadoraForm>): Promise<void> {
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
