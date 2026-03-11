import db from '../../db';
import { IColaborador, IColaboradorForm, IColaboradorFilters } from '../../entities/rh';
import ColaboradorRepository from '../../repositories/rh/ColaboradorRepository';

// Campos de data que precisam ser NULL quando vazios (camelCase - knex-stringcase converte para snake_case)
const DATE_FIELDS = [
  'dataNascimento',
  'dataAdmissao',
  'dataDemissao',
  'experienciaInicio',
  'experienciaFim'
];

// Converte strings vazias para NULL em campos específicos
function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data };
  for (const field of DATE_FIELDS) {
    if (sanitized[field] === '' || sanitized[field] === undefined) {
      sanitized[field] = null;
    }
  }
  // Também converte salario vazio para null
  if (sanitized.salario === '' || sanitized.salario === undefined) {
    sanitized.salario = null;
  }
  return sanitized;
}

export class ColaboradorRepositoryImpl implements ColaboradorRepository {
  private readonly tableName = 'rh_colaboradores_iecb';

  async find(filters: IColaboradorFilters): Promise<IColaborador[]> {
    let query = db(this.tableName)
      .where('empresa', filters.empresa)
      .where('ativo', filters.ativo ?? 1);

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.setor) {
      query = query.where('setor', filters.setor);
    }

    if (filters.search) {
      query = query.where(function () {
        this.where('nome', 'like', `%${filters.search}%`)
          .orWhere('cpf', 'like', `%${filters.search}%`)
          .orWhere('email', 'like', `%${filters.search}%`)
          .orWhere('cargo', 'like', `%${filters.search}%`);
      });
    }

    return query.orderBy('nome', 'asc');
  }

  async getById(id: number, empresa: number): Promise<IColaborador | null> {
    const result = await db(this.tableName)
      .where({ id, empresa })
      .first();
    return result ?? null;
  }

  async create(data: IColaboradorForm): Promise<number> {
    const sanitized = sanitizeData(data as unknown as Record<string, unknown>);
    const [id] = await db(this.tableName).insert(sanitized);
    return id;
  }

  async update(id: number, data: Partial<IColaboradorForm>, empresa: number): Promise<void> {
    const sanitized = sanitizeData(data as unknown as Record<string, unknown>);
    await db(this.tableName)
      .update(sanitized)
      .where({ id, empresa });
  }

  async delete(id: number, empresa: number): Promise<void> {
    // Soft delete
    await db(this.tableName)
      .update({ ativo: 0 })
      .where({ id, empresa });
  }

  async updateStatus(id: number, status: string, empresa: number): Promise<void> {
    await db(this.tableName)
      .update({ status })
      .where({ id, empresa });
  }

  async updateScoreIntegracao(id: number, score: number, empresa: number): Promise<void> {
    await db(this.tableName)
      .update({ scoreIntegracao: score })
      .where({ id, empresa });
  }

  async countByEmpresa(empresa: number): Promise<number> {
    const result = await db(this.tableName)
      .where({ empresa, ativo: 1 })
      .count('id as count')
      .first();
    return Number(result?.count || 0);
  }

  async countByStatus(empresa: number, status: string): Promise<number> {
    const result = await db(this.tableName)
      .where({ empresa, status, ativo: 1 })
      .count('id as count')
      .first();
    return Number(result?.count || 0);
  }
}
