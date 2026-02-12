import db from '../db';
import { IAluno, IAlunoForm } from '../entities/IAluno';
import AlunoRepository from '../repositories/AlunoRepository';

/**
 * Alunos é uma tabela de relacionamento entre:
 * - acompanhamento_iecb (cliente/lead) via id_aluno
 * - aulas_iecb (aula) via id_aula
 *
 * Representa a matrícula de um cliente em uma aula específica
 */
export class AlunoRepositoryImpl implements AlunoRepository {
  private readonly tableName = 'alunos_iecb';

  async findByAula(idAula: number, ativo: number): Promise<IAluno[]> {
    return db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'acompanhamento_iecb.nome as nomeAluno',
        'acompanhamento_iecb.telefone'
      )
      .leftJoin('acompanhamento_iecb', `${this.tableName}.id_aluno`, 'acompanhamento_iecb.id')
      .where(`${this.tableName}.id_aula`, idAula)
      .where(`${this.tableName}.ativo`, ativo)
      .orderBy('acompanhamento_iecb.nome', 'asc');
  }

  async findByAulaAndData(idAula: number, data: string): Promise<IAluno[]> {
    return db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'acompanhamento_iecb.nome as nomeAluno',
        'acompanhamento_iecb.telefone'
      )
      .leftJoin('acompanhamento_iecb', `${this.tableName}.id_aluno`, 'acompanhamento_iecb.id')
      .where(`${this.tableName}.id_aula`, idAula)
      .where(`${this.tableName}.data`, data)
      .where(`${this.tableName}.ativo`, 1)
      .orderBy('acompanhamento_iecb.nome', 'asc');
  }

  async getById(id: number): Promise<IAluno | null> {
    const result = await db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'acompanhamento_iecb.nome as nomeAluno',
        'acompanhamento_iecb.telefone'
      )
      .leftJoin('acompanhamento_iecb', `${this.tableName}.id_aluno`, 'acompanhamento_iecb.id')
      .where(`${this.tableName}.id`, id)
      .first();
    return result ?? null;
  }

  async create(data: IAlunoForm): Promise<number> {
    const [id] = await db(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: Partial<IAlunoForm>): Promise<void> {
    await db(this.tableName).update(data).where({ id });
  }

  async updateStatus(id: number, status: number): Promise<void> {
    await db(this.tableName).update({ status }).where({ id });
  }

  async delete(id: number): Promise<void> {
    await db(this.tableName).update({ ativo: 0 }).where({ id });
  }

  async sumValorByAula(idAula: number): Promise<number> {
    const result = await db(this.tableName)
      .where({ idAula, ativo: 1 })
      .sum('valor as total')
      .first();
    return Number(result?.total || 0);
  }
}
