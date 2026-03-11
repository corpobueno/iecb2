import { IChecklistAdmissao, IChecklistAdmissaoForm, IChecklistAdmissaoUpdate, IChecklistStats } from '../../entities/rh';

export default interface ChecklistAdmissaoRepository {
  findByColaborador(idColaborador: number): Promise<IChecklistAdmissao[]>;
  getById(id: number): Promise<IChecklistAdmissao | null>;
  create(data: IChecklistAdmissaoForm): Promise<number>;
  createMany(items: IChecklistAdmissaoForm[]): Promise<void>;
  update(id: number, data: IChecklistAdmissaoUpdate): Promise<void>;
  delete(id: number): Promise<void>;
  deleteByColaborador(idColaborador: number): Promise<void>;
  getStats(idColaborador: number): Promise<IChecklistStats>;
}
