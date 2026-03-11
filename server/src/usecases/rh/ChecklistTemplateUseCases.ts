import { IChecklistTemplate, IChecklistTemplateForm, IChecklistTemplateFilters } from '../../entities/rh';
import ChecklistTemplateRepository from '../../repositories/rh/ChecklistTemplateRepository';
import { AppError } from '../../utils/AppError';

export class ChecklistTemplateUseCases {
  constructor(private repository: ChecklistTemplateRepository) {}

  async find(filters: IChecklistTemplateFilters): Promise<IChecklistTemplate[]> {
    return this.repository.find(filters);
  }

  async getById(id: number, empresa: number): Promise<IChecklistTemplate> {
    const result = await this.repository.getById(id, empresa);
    if (!result) {
      throw new AppError('Template de checklist não encontrado', 404);
    }
    return result;
  }

  async create(data: IChecklistTemplateForm): Promise<number> {
    if (!data.item) {
      throw new AppError('Item é obrigatório', 400);
    }
    if (!data.empresa) {
      throw new AppError('Empresa é obrigatória', 400);
    }
    return this.repository.create(data);
  }

  async update(id: number, data: Partial<IChecklistTemplateForm>, empresa: number): Promise<void> {
    const existing = await this.repository.getById(id, empresa);
    if (!existing) {
      throw new AppError('Template de checklist não encontrado', 404);
    }
    return this.repository.update(id, data, empresa);
  }

  async delete(id: number, empresa: number): Promise<void> {
    const existing = await this.repository.getById(id, empresa);
    if (!existing) {
      throw new AppError('Template de checklist não encontrado', 404);
    }
    return this.repository.delete(id, empresa);
  }

  async findBySetor(empresa: number, setor: string | null): Promise<IChecklistTemplate[]> {
    return this.repository.findBySetor(empresa, setor);
  }

  /**
   * Retorna lista de setores únicos que possuem templates
   */
  async getSetores(empresa: number): Promise<string[]> {
    const templates = await this.repository.find({ empresa, ativo: 1 });
    const setores = new Set<string>();

    templates.forEach(t => {
      if (t.setor) {
        setores.add(t.setor);
      }
    });

    return Array.from(setores).sort();
  }
}
