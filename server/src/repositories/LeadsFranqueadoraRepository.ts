import { ILeadsFranqueadoraComentario, ILeadsFranqueadoraForm, ILeadsFranqueadora, ILeadsFranqueadoraFiltros, ILeadsFranqueadoraComentarioForm } from '../entities/ILeadsFranqueadora';

export default interface LeadsFranqueadoraRepository {
  // Lista principal de leads da tabela leads_franqueadora
  findPrincipal(filtros: ILeadsFranqueadoraFiltros): Promise<{ data: ILeadsFranqueadora[]; totalCount: number }>;

  // Busca um lead específico por ID
  getById(id: number): Promise<ILeadsFranqueadora | null>;

  // Cria um novo lead
  create(data: ILeadsFranqueadoraForm): Promise<number>;

  // Atualiza um lead
  update(id: number, data: Partial<ILeadsFranqueadoraForm>): Promise<void>;

  // Deleta um lead (soft delete)
  delete(id: number): Promise<void>;

  // ========================================
  // MÉTODOS PARA COMENTÁRIOS
  // ========================================

  // Busca comentários/histórico por telefone
  getComentariosByTelefone(telefone: string): Promise<ILeadsFranqueadoraComentario[]>;

  // Cria um novo comentário
  createComentario(data: ILeadsFranqueadoraComentarioForm): Promise<number>;

  // Conta comentários por telefone
  countTentativasByTelefone(telefone: string): Promise<number>;

  // ========================================
  // MÉTODOS LEGADOS
  // ========================================
  find(page: number, limit: number, filter: string): Promise<{ data: ILeadsFranqueadora[]; totalCount: number }>;
}
