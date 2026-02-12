import db from '../db';
import { IAgenda, IAgendaForm } from '../entities/IAgenda';
import AgendaRepository from '../repositories/AgendaRepository';

export class AgendaRepositoryImpl implements AgendaRepository {
  private readonly tableName = 'agenda_iecb';

  async findByData(data: string, ativo: number): Promise<IAgenda[]> {
    return db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'aulas_iecb.docente',
        'aulas_iecb.valor',
        'cursos_iecb.nome as nomeCurso',
        'cursos_iecb.color as cursoColor',
        'docentes.color',
        'docentes.nome as nomeDocente'
      )
      .leftJoin('aulas_iecb', `${this.tableName}.id_aula`, 'aulas_iecb.id')
      .leftJoin('cursos_iecb', 'aulas_iecb.id_curso', 'cursos_iecb.id')
      .leftJoin('docentes', 'aulas_iecb.docente', 'docentes.login')
      .where(`${this.tableName}.data`, data)
      .where(`aulas_iecb.ativo`, ativo)
      .orderBy(`${this.tableName}.hora`, 'asc');
  }

  async findByPeriodo(dataInicio: string, dataFim: string, ativo: number): Promise<IAgenda[]> {
    return db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'aulas_iecb.docente',
        'aulas_iecb.valor',
        'cursos_iecb.nome as nomeCurso',
        'cursos_iecb.color as cursoColor',
        'docentes.color',
        'docentes.nome as nomeDocente'
      )
      .leftJoin('aulas_iecb', `${this.tableName}.id_aula`, 'aulas_iecb.id')
      .leftJoin('cursos_iecb', 'aulas_iecb.id_curso', 'cursos_iecb.id')
      .leftJoin('docentes', 'aulas_iecb.docente', 'docentes.login')
      .whereBetween(`${this.tableName}.data`, [dataInicio, dataFim])
      .where(`aulas_iecb.ativo`, ativo)
      .orderBy(`${this.tableName}.data`, 'asc')
      .orderBy(`${this.tableName}.hora`, 'asc');
  }

  async getById(id: number): Promise<IAgenda | null> {
    const result = await db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'aulas_iecb.docente',
        'cursos_iecb.nome as nomeCurso',
        'cursos_iecb.color as cursoColor',
        'docentes.color',
        'docentes.nome as nomeDocente'
      )
      .leftJoin('aulas_iecb', `${this.tableName}.id_aula`, 'aulas_iecb.id')
      .leftJoin('cursos_iecb', 'aulas_iecb.id_curso', 'cursos_iecb.id')
      .leftJoin('docentes', 'aulas_iecb.docente', 'docentes.login')
      .where(`${this.tableName}.id`, id)
      .first();
    return result ?? null;
  }

  async create(data: IAgendaForm): Promise<number> {
    const [id] = await db(this.tableName).insert(data);
    return id;
  }

  async update(id: number, data: Partial<IAgendaForm>): Promise<void> {
    await db(this.tableName).update(data).where({ id });
  }

  async delete(id: number): Promise<void> {
    await db(this.tableName).update({ ativo: 0 }).where({ id });
  }

  async countByAula(idAula: number): Promise<number> {
    const result = await db(this.tableName)
      .count('id as count')
      .where('id_aula', idAula)
      .where('ativo', 1)
      .first();
    return Number(result?.count) || 0;
  }
}
