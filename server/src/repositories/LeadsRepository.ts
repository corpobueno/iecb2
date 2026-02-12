import { ILeads, ILeadsForm, ILeadsPrincipal, ILeadsFiltros, ILeadsComentarioForm } from '../entities/ILeads';

export default interface LeadsRepository {
  // Lista principal de leads da tabela leads_iecb
  findPrincipal(filtros: ILeadsFiltros): Promise<{ data: ILeadsPrincipal[]; totalCount: number }>;

  // Busca um lead específico por ID
  getById(id: number): Promise<ILeadsPrincipal | null>;

  // Cria um novo lead
  create(data: ILeadsForm): Promise<number>;

  // Atualiza um lead
  update(id: number, data: Partial<ILeadsForm>): Promise<void>;

  // Deleta um lead (soft delete)
  delete(id: number): Promise<void>;

  // ========================================
  // MÉTODOS PARA COMENTÁRIOS
  // ========================================

  // Busca comentários/histórico por telefone
  getComentariosByTelefone(telefone: string): Promise<ILeads[]>;

  // Cria um novo comentário
  createComentario(data: ILeadsComentarioForm): Promise<number>;

  // Conta comentários por telefone
  countTentativasByTelefone(telefone: string): Promise<number>;

  // ========================================
  // MÉTODOS LEGADOS
  // ========================================
  find(page: number, limit: number, filter: string): Promise<{ data: ILeads[]; totalCount: number }>;
}
