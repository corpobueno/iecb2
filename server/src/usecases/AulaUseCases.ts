import { IAula, IAulaForm } from '../entities/IAula';
import AgendaRepository from '../repositories/AgendaRepository';
import AulaRepository from '../repositories/AulaRepository';
import PagamentoRepository from '../repositories/PagamentoRepository';
import { AppError } from '../utils/AppError';

export class AulaUseCases {
  constructor(private aulaRepository: AulaRepository, private pagamentoRepository: PagamentoRepository, private agendaRepository: AgendaRepository) { }

  async find(ativo: number = 1): Promise<IAula[]> {
    return this.aulaRepository.find(ativo);
  }

  async findDisponiveis(ativo: number = 1): Promise<IAula[]> {
    return this.aulaRepository.findDisponiveis(ativo);
  }

  async getById(id: number): Promise<IAula> {
    const result = await this.aulaRepository.getById(id);
    if (!result) {
      throw new AppError('Aula não encontrada', 404);
    }
    return result;
  }

  async create(data: IAulaForm): Promise<number> {
    if (!data.idCurso) {
      throw new AppError('Curso é obrigatório', 400);
    }
    if (!data.docente) {
      throw new AppError('Docente é obrigatório', 400);
    }
    return this.aulaRepository.create(data);
  }

  async update(id: number, data: Partial<IAulaForm>): Promise<void> {
    const existing = await this.aulaRepository.getById(id);
    if (!existing) {
      throw new AppError('Aula não encontrada', 404);
    }
    return this.aulaRepository.update(id, data);
  }

  async cancel(id: number): Promise<void> {
    const existing = await this.aulaRepository.getById(id);
    if (!existing) {
      throw new AppError('Aula não encontrada', 404);
    }


    await this.pagamentoRepository.cancelByaula(id);
    //await this.agendaRepository.delete(id);
    return this.aulaRepository.update(id, { ativo: 0 });
  }

  async delete(id: number): Promise<void> {
    const existing = await this.aulaRepository.getById(id);
    if (!existing) {
      throw new AppError('Aula não encontrada', 404);
    }
    return this.aulaRepository.delete(id);
  }
}
