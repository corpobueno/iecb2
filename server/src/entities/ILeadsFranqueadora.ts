// ========================================
// LEADS FRANQUEADORA - Tabela leads_franqueadora
// ========================================

// Interface principal - representa a tabela leads_franqueadora
export interface ILeadsFranqueadora {
  id: number;
  nome: string;
  telefone: string;
  status: string;
  origem: string;
  email: string | null;
  rede: number | null;
  dataCadastro: string;
  user: string | null;
  cidade: string;
  estado: string;
}

export interface ILeadsFranqueadoraPage {
  data: ILeadsFranqueadora[];
  totalCount: number;
}

// Interface para criação/edição de leads
export interface ILeadsFranqueadoraForm {
  nome: string;
  telefone: string;
  email?: string;
  status?: string;
  origem?: string;
  rede?: number;
  user?: string;
  cidade?: string;
  estado?: string;
}

// Interface para os filtros de busca
export interface ILeadsFranqueadoraFiltros {
  page: number;
  limit?: number;
  filter?: string;
  dataInicio?: string;
  dataFim?: string;
  status?: string;
  user?: string;
}

// ========================================
// COMENTÁRIOS DE LEADS FRANQUEADORA (tabela separada)
// ========================================
export interface ILeadsFranqueadoraComentarioForm {
  idLeads: number;
  telefone: string;
  nota: string;
  status: string;
  user: string;
  tabela: string;
}

// Mantém compatibilidade com código legado de comentários
export interface ILeadsFranqueadoraComentario extends ILeadsFranqueadoraComentarioForm {
  id: number;
  data: Date;
}
