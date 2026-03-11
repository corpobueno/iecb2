import db from '../../db';
import { IChecklistTemplate, IChecklistTemplateForm, IChecklistTemplateFilters } from '../../entities/rh';
import ChecklistTemplateRepository from '../../repositories/rh/ChecklistTemplateRepository';

export class ChecklistTemplateRepositoryImpl implements ChecklistTemplateRepository {
  private readonly tableName = 'rh_checklist_template_iecb';

  async find(filters: IChecklistTemplateFilters): Promise<IChecklistTemplate[]> {
    let query = db(this.tableName)
      .where('empresa', filters.empresa)
      .where('ativo', filters.ativo ?? 1);

    if (filters.setor !== undefined) {
      if (filters.setor === null || filters.setor === '') {
        query = query.whereNull('setor');
      } else {
        query = query.where('setor', filters.setor);
      }
    }

    return query.orderBy('ordem', 'asc').orderBy('item', 'asc');
  }

  async getById(id: number, empresa: number): Promise<IChecklistTemplate | null> {
    const result = await db(this.tableName)
      .where({ id, empresa })
      .first();
    return result ?? null;
  }

  async create(data: IChecklistTemplateForm): Promise<number> {
    const [id] = await db(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: Partial<IChecklistTemplateForm>, empresa: number): Promise<void> {
    await db(this.tableName)
      .update(data)
      .where({ id, empresa });
  }

  async delete(id: number, empresa: number): Promise<void> {
    // Soft delete
    await db(this.tableName)
      .update({ ativo: 0 })
      .where({ id, empresa });
  }

  async findBySetor(empresa: number, setor: string | null): Promise<IChecklistTemplate[]> {
    // Retorna itens do setor específico + itens gerais (setor = NULL)
    return db(this.tableName)
      .where('empresa', empresa)
      .where('ativo', 1)
      .where(function () {
        this.whereNull('setor');
        if (setor) {
          this.orWhere('setor', setor);
        }
      })
      .orderBy('ordem', 'asc')
      .orderBy('item', 'asc');
  }
}
