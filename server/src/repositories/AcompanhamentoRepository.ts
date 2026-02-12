import { IAcompanhamento, IAcompanhamentoForm } from '../entities/IAcompanhamento';

export default interface AcompanhamentoRepository {
  find(page: number, limit: number, filter: string): Promise<{ data: IAcompanhamento[]; totalCount: number }>;
  getById(id: number): Promise<IAcompanhamento | null>;
  create(data: IAcompanhamentoForm): Promise<number>;
  update(id: number, data: Partial<IAcompanhamentoForm>): Promise<void>;
  delete(id: number): Promise<void>;
}
