import db from '../db';
import { IAula, IAulaForm } from '../entities/IAula';
import AulaRepository from '../repositories/AulaRepository';

export class AulaRepositoryImpl implements AulaRepository {
  private readonly tableName = 'aulas_iecb';

  async find(ativo: number): Promise<IAula[]> {
    return db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'cursos_iecb.nome as nomeCurso',
        'cursos_iecb.color',
        'docentes.nome as nomeDocente'
      )
      .leftJoin('cursos_iecb', `${this.tableName}.id_curso`, 'cursos_iecb.id')
      .leftJoin('docentes', `${this.tableName}.docente`, 'docentes.login')
      .where(`${this.tableName}.ativo`, ativo)
      .orderBy(`${this.tableName}.id`, 'desc');
  }

  async findDisponiveis(ativo: number): Promise<IAula[]> {
    // Retorna aulas que ainda têm vagas disponíveis
    return db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'cursos_iecb.nome as nomeCurso',
        'cursos_iecb.color',
        'docentes.nome as nomeDocente'
      )
      .leftJoin('cursos_iecb', `${this.tableName}.id_curso`, 'cursos_iecb.id')
      .leftJoin('docentes', `${this.tableName}.docente`, 'docentes.login')
      .where(`${this.tableName}.ativo`, ativo)
      .whereRaw(`${this.tableName}.qnt > (SELECT COUNT(*) FROM alunos_iecb WHERE alunos_iecb.id_aula = ${this.tableName}.id AND alunos_iecb.ativo = 1)`)
      .orderBy(`${this.tableName}.id`, 'desc');
  }

  async getById(id: number): Promise<IAula | null> {
    const result = await db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'cursos_iecb.nome as nomeCurso',
        'cursos_iecb.color',
        'docentes.nome as nomeDocente'
      )
      .leftJoin('cursos_iecb', `${this.tableName}.id_curso`, 'cursos_iecb.id')
      .leftJoin('docentes', `${this.tableName}.docente`, 'docentes.login')
      .where(`${this.tableName}.id`, id)
      .first();
    return result ?? null;
  }

  async create(data: IAulaForm): Promise<number> {
    const [id] = await db(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: Partial<IAulaForm>): Promise<void> {
    await db(this.tableName).update(data).where({ id });
  }

  async delete(id: number): Promise<void> {
    await db(this.tableName).update({ ativo: 0 }).where({ id });
  }
}
