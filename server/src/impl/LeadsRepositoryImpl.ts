import db from '../db';
import { ILeads, ILeadsForm, ILeadsPrincipal, ILeadsFiltros, ILeadsComentarioForm } from '../entities/ILeads';
import LeadsRepository from '../repositories/LeadsRepository';

// Mapeamento de colunas do banco para a interface ILeadsPrincipal
// Knex converte snake_case para camelCase automaticamente
const mapToPrincipal = (row: any): ILeadsPrincipal => ({
  id: row.idL,
  dataId: row.dataId,
  nome: row.nomeL || '',
  email: row.emailL,
  telefone: row.telefoneL || '',
  mesAniversario: row.mesAniversarioL,
  interesse: row.interesseL,
  rede: row.redeL,
  link: row.linkL,
  dataCadastro: row.dataCadastroL,
  dataCarteira: row.dataCarteira,
  selecao: row.selecao,
  usuario: row.idUsuario,
  ativo: row.ativo ?? 1,
});

// Mapeamento da interface para colunas do banco (INSERT/UPDATE usam snake_case)
const mapToDb = (data: Partial<ILeadsForm>): Record<string, any> => {
  const mapped: Record<string, any> = {};
  if (data.nome !== undefined) mapped.nome_l = data.nome;
  if (data.telefone !== undefined) mapped.telefone_l = data.telefone;
  if (data.email !== undefined) mapped.email_l = data.email;
  if (data.interesse !== undefined) mapped.interesse_l = data.interesse;
  if (data.mesAniversario !== undefined) mapped.mes_aniversario_l = data.mesAniversario;
  if (data.rede !== undefined) mapped.rede_l = data.rede;
  if (data.usuario !== undefined) mapped.id_usuario = data.usuario;
  if (data.selecao !== undefined) mapped.selecao = data.selecao;
  return mapped;
};

// Mapeamento para comentários
const mapToComentario = (row: any): ILeads => ({
  id: row.id,
  idLeads: row.id_lead,
  telefone: row.telefone,
  texto: row.texto,
  status: row.status,
  usuario: row.usuario,
  data: row.data,
  leads: row.leads,
});

export class LeadsRepositoryImpl implements LeadsRepository {
  private readonly tableName = 'leads_iecb';
  private readonly comentariosTable = 'comentario_leads';

  async findPrincipal(filtros: ILeadsFiltros): Promise<{ data: ILeadsPrincipal[]; totalCount: number }> {
    const { page, limit = 20, filter, dataInicio, dataFim, selecao, usuario } = filtros;
    const offset = (page - 1) * limit;

    // Query principal - usando SELECT * para debug
    let query = db(this.tableName)
      .select('*')
      .where('ativo', 1);

    // Aplicar filtros
    if (filter) {
      query = query.where((builder) => {
        builder
          .where('telefone_l', 'like', `%${filter}%`)
          .orWhere('nome_l', 'like', `%${filter}%`)
          .orWhere('email_l', 'like', `%${filter}%`);
      });
    }

    if (dataInicio && dataFim) {
      query = query.whereBetween('data_cadastro_l', [dataInicio, `${dataFim} 23:59:59`]);
    }

    if (selecao) {
      query = query.where('selecao', selecao);
    }

    if (usuario && selecao !== 'nao') {
      query = query.where('id_usuario', usuario);
    }

    // Count total
    const countResult = await query.clone().count('* as totalCount').first();
    const totalCount = Number(countResult?.totalCount || 0);

    // Buscar dados paginados
    const rows = await query
      .clone()
      .orderBy('data_cadastro_l', 'desc')
      .limit(limit)
      .offset(offset);

    const data = rows.map(mapToPrincipal);
    return { data, totalCount };
  }

  async getById(id: number): Promise<ILeadsPrincipal | null> {
    const result = await db(this.tableName)
      .select('*')
      .where('id_l', id)
      .first();

    return result ? mapToPrincipal(result) : null;
  }

  async create(data: ILeadsForm): Promise<number> {
    const dbData = {
      ...mapToDb(data),
      data_cadastro_l: db.fn.now(),
      ativo: 1,
    };
    const [id] = await db(this.tableName).insert(dbData);
    return id;
  }

  async update(id: number, data: Partial<ILeadsForm>): Promise<void> {
    await db(this.tableName).update(mapToDb(data)).where('id_l', id);
  }

  async delete(id: number): Promise<void> {
    // Soft delete - apenas marca como inativo
    await db(this.tableName).update({ ativo: 0 }).where('id_l', id);
  }

  // ========================================
  // MÉTODOS PARA COMENTÁRIOS
  // ========================================

  async getComentariosByTelefone(telefone: string): Promise<ILeads[]> {
    try {
      const rows = await db(this.comentariosTable)
        .where('telefone', telefone)
        .orderBy('data', 'desc');

      return rows.map(mapToComentario);
    } catch (error) {
      // Se a tabela não existir, retorna array vazio
      console.warn('Tabela de comentários não encontrada ou erro:', error);
      return [];
    }
  }

  async createComentario(data: ILeadsComentarioForm): Promise<number> {
    try {
      const dbData = {
        id_leads: data.idLeads,
        telefone: data.telefone,
        texto: data.texto,
        status: data.status,
        usuario: data.usuario,
        data: db.fn.now(),
      };
      const [id] = await db(this.comentariosTable).insert(dbData);
      return id;
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      throw error;
    }
  }

  // ========================================
  // MÉTODOS LEGADOS (para compatibilidade)
  // ========================================

  async find(page: number, limit: number, filter: string): Promise<{ data: ILeads[]; totalCount: number }> {
    // Redireciona para findPrincipal
    const result = await this.findPrincipal({ page, limit, filter });
    return {
      data: [],
      totalCount: result.totalCount,
    };
  }

  async countTentativasByTelefone(telefone: string): Promise<number> {
    const result = await db(this.comentariosTable)
      .where({ telefone })
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }
}
