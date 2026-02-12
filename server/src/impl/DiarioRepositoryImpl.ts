import db from '../db';
import { IDiarioAluno, IDiarioAula, IDiarioFilters } from '../entities/IDiario';
import DiarioRepository from '../repositories/DiarioRepository';

export class DiarioRepositoryImpl implements DiarioRepository {
  async getAulas(filters: IDiarioFilters): Promise<IDiarioAula[]> {
    let query = db('aulas_iecb as a')
      .select(
        'a.id',
        'a.id_curso as idCurso',
        'a.valor',
        'a.docente',
        'a.nota',
        'a.usuario',
        'ag.data',
        'c.nome as nomeCurso',
        'c.rateio_modelo as rateioModelo',
        'd.color',
        'd.nome as nomeDocente',
        'd.rateio',
        'd.rateio_regular as rateioRegular',
        db.raw('COALESCE(SUM(pg.valor), 0) as soma'),
        db.raw('(SELECT COUNT(*) FROM alunos_iecb al WHERE al.id_aula = a.id AND al.tipo = 1 AND al.ativo = 1) as count')
      )
      .innerJoin('docentes as d', 'a.docente', 'd.login')
      .innerJoin('cursos_iecb as c', 'c.id', 'a.id_curso')
      .leftJoin('agenda_iecb as ag', function() {
        this.on('ag.id_aula', '=', 'a.id').andOn('ag.ativo', '=', db.raw('1'));
      })
      .leftJoin('pagamento_iecb as pg', function() {
        this.on('pg.id_aula', '=', 'a.id').andOn('pg.ativo', '=', db.raw('1'));
      })
      .whereBetween('ag.data', [filters.dataInicio, filters.dataFim])
      .where('a.ativo', 1)
      .groupBy('a.id')
      .orderBy('ag.data', 'asc')
      .orderBy('a.data_agendado', 'asc');

    if (filters.docente) {
      query = query.where('a.docente', filters.docente);
    }

    if (filters.usuario) {
      query = query.where('a.usuario', filters.usuario);
    }

    return query;
  }

  async getAlunos(idAula: number, status?: number, tipo?: number): Promise<IDiarioAluno[]> {
    let query = db('alunos_iecb as al')
      .select(
        'al.id',
        'al.id_aluno as idAluno',
        'al.id_aula as idAula',
        'al.data',
        'al.usuario',
        'al.valor',
        'al.tipo',
        'al.status',
        'al.ativo',
        'ac.nome as nomeAluno'
      )
      .innerJoin('acompanhamento_iecb as ac', 'ac.id', 'al.id_aluno')
      .where('al.id_aula', idAula)
      .where('al.ativo', 1)
      .orderBy('ac.nome', 'asc');

    if (status !== undefined && status !== null) {
      query = query.where('al.status', status);
    }

    if (tipo !== undefined && tipo !== null) {
      query = query.where('al.tipo', tipo);
    }

    return query;
  }

  async getDocentes(dataInicio: string, dataFim: string, usuario?: string): Promise<{ id: string; nome: string }[]> {
    let query = db('aulas_iecb as a')
      .select('a.docente as id', 'd.nome')
      .innerJoin('docentes as d', 'a.docente', 'd.login')
      .innerJoin('agenda_iecb as ag', function() {
        this.on('ag.id_aula', '=', 'a.id').andOn('ag.ativo', '=', db.raw('1'));
      })
      .whereBetween('ag.data', [dataInicio, dataFim])
      .where('a.ativo', 1)
      .groupBy('a.docente')
      .orderBy('a.docente', 'asc');

    if (usuario) {
      query = query.where('a.usuario', usuario);
    }

    return query;
  }

  async getUsuarios(dataInicio: string, dataFim: string, docente?: string): Promise<{ id: string }[]> {
    let query = db('aulas_iecb as a')
      .select('a.usuario as id')
      .innerJoin('agenda_iecb as ag', function() {
        this.on('ag.id_aula', '=', 'a.id').andOn('ag.ativo', '=', db.raw('1'));
      })
      .whereBetween('ag.data', [dataInicio, dataFim])
      .where('a.ativo', 1)
      .groupBy('a.usuario')
      .orderBy('a.usuario', 'asc');

    if (docente) {
      query = query.where('a.docente', docente);
    }

    return query;
  }
}
