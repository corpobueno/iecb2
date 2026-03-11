import { IChecklistTemplate, IChecklistTemplateForm, IChecklistTemplateFilters } from '../../entities/rh';

export default interface ChecklistTemplateRepository {
  find(filters: IChecklistTemplateFilters): Promise<IChecklistTemplate[]>;
  getById(id: number, empresa: number): Promise<IChecklistTemplate | null>;
  create(data: IChecklistTemplateForm): Promise<number>;
  update(id: number, data: Partial<IChecklistTemplateForm>, empresa: number): Promise<void>;
  delete(id: number, empresa: number): Promise<void>;
  findBySetor(empresa: number, setor: string | null): Promise<IChecklistTemplate[]>;
}
