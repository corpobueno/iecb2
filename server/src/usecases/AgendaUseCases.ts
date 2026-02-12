import { IAgenda, IAgendaForm } from '../entities/IAgenda';
import AgendaRepository from '../repositories/AgendaRepository';
import { AppError } from '../utils/AppError';

export class AgendaUseCases {
  constructor(private repository: AgendaRepository) {}

  async findByData(data: string, ativo: number = 1): Promise<IAgenda[]> {
    return this.repository.findByData(data, ativo);
  }

  async findByPeriodo(dataInicio: string, dataFim: string, ativo: number = 1): Promise<IAgenda[]> {
    if (!dataInicio || !dataFim) {
      throw new AppError('Data início e fim são obrigatórias', 400);
    }
    return this.repository.findByPeriodo(dataInicio, dataFim, ativo);
  }

  async getById(id: number): Promise<IAgenda> {
    const result = await this.repository.getById(id);
    if (!result) {
      throw new AppError('Agendamento não encontrado', 404);
    }
    return result;
  }

  async create(data: IAgendaForm): Promise<number> {
    if (!data.idAula) {
      throw new AppError('Aula é obrigatória', 400);
    }
    if (!data.data) {
      throw new AppError('Data é obrigatória', 400);
    }
    if (!data.hora) {
      throw new AppError('Hora é obrigatória', 400);
    }
    if (!data.horaFim) {
      throw new AppError('Hora fim é obrigatória', 400);
    }
    return this.repository.create(data);
  }

  async update(id: number, data: Partial<IAgendaForm>): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Agendamento não encontrado', 404);
    }
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Agendamento não encontrado', 404);
    }
    return this.repository.delete(id);
  }

  async countByAula(idAula: number): Promise<number> {
    return this.repository.countByAula(idAula);
  }
}
