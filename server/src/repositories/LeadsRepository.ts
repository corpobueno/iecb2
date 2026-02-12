import { ILeads, ILeadsForm } from '../entities/ILeads';

export default interface LeadsRepository {
  find(page: number, limit: number, filter: string): Promise<{ data: ILeads[]; totalCount: number }>;
  getById(id: number): Promise<ILeads | null>;
  create(data: ILeadsForm): Promise<number>;
  update(id: number, data: Partial<ILeadsForm>): Promise<void>;
  delete(id: number): Promise<void>;
}
