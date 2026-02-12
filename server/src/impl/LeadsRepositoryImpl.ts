import db from '../db';
import { ILeads, ILeadsForm } from '../entities/ILeads';
import LeadsRepository from '../repositories/LeadsRepository';

// Mapeamento de colunas do banco (com sufixo _l) para a interface
const mapToEntity = (row: any): ILeads => ({
  id: row.id_l,
  nome: row.nome_l,
  email: row.email_l,
  telefone: row.telefone_l,
  interesse: row.interesse_l,
  dataCadastro: row.data_cadastro_l,
  selecao: row.selecao,
  idUsuario: row.id_usuario,
  tentativas: row.tentativas,
  nota: row.nota,
  ativo: row.ativo,
});

// Mapeamento da interface para colunas do banco
const mapToDb = (data: Partial<ILeadsForm>): Record<string, any> => {
  const mapped: Record<string, any> = {};
  if (data.nome !== undefined) mapped.nome_l = data.nome;
  if (data.email !== undefined) mapped.email_l = data.email;
  if (data.telefone !== undefined) mapped.telefone_l = data.telefone;
  if (data.interesse !== undefined) mapped.interesse_l = data.interesse;
  if (data.selecao !== undefined) mapped.selecao = data.selecao;
  if (data.idUsuario !== undefined) mapped.id_usuario = data.idUsuario;
  if (data.tentativas !== undefined) mapped.tentativas = data.tentativas;
  if (data.nota !== undefined) mapped.nota = data.nota;
  return mapped;
};

export class LeadsRepositoryImpl implements LeadsRepository {
  private readonly tableName = 'leads_iecb';

  async find(page: number, limit: number, filter: string): Promise<{ data: ILeads[]; totalCount: number }> {
    const offset = (page - 1) * limit;

    let query = db(this.tableName).where('ativo', 1);

    if (filter) {
      query = query.where((builder) => {
        builder
          .where('nome_l', 'like', `%${filter}%`)
          .orWhere('telefone_l', 'like', `%${filter}%`)
          .orWhere('email_l', 'like', `%${filter}%`);
      });
    }

    const countResult = await query.clone().count('* as totalCount').first();
    const totalCount = Number(countResult?.totalCount || 0);

    const rows = await query
      .clone()
      .select('*')
      .orderBy('id_l', 'desc')
      .limit(limit)
      .offset(offset);

    const data = rows.map(mapToEntity);

    return { data, totalCount };
  }

  async getById(id: number): Promise<ILeads | null> {
    const result = await db(this.tableName).where({ id_l: id }).first();
    return result ? mapToEntity(result) : null;
  }

  async create(data: ILeadsForm): Promise<number> {
    const dbData = {
      ...mapToDb(data),
      data_cadastro_l: new Date(),
      ativo: 1,
    };
    const [id] = await db(this.tableName).insert(dbData);
    return id;
  }

  async update(id: number, data: Partial<ILeadsForm>): Promise<void> {
    await db(this.tableName).update(mapToDb(data)).where({ id_l: id });
  }

  async delete(id: number): Promise<void> {
    await db(this.tableName).update({ ativo: 0 }).where({ id_l: id });
  }
}
