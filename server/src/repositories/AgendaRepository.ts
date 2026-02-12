import { IAgenda, IAgendaForm } from '../entities/IAgenda';

export default interface AgendaRepository {
  findByData(data: string, ativo: number): Promise<IAgenda[]>;
  findByPeriodo(dataInicio: string, dataFim: string, ativo: number): Promise<IAgenda[]>;
  getById(id: number): Promise<IAgenda | null>;
  create(data: IAgendaForm): Promise<number>;
  update(id: number, data: Partial<IAgendaForm>): Promise<void>;
  delete(id: number): Promise<void>;
  countByAula(idAula: number): Promise<number>;
}
