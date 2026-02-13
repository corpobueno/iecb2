// ========================================
// LEADS IECB - Tabela leads_iecb
// ========================================

// Interface principal - representa a tabela leads_iecb
export interface ILeadsPrincipal {
  id: number;                    // id_l
  dataId: number | null;         // data_id
  nome: string;                  // nome_l
  email: string | null;          // email_l
  telefone: string;              // telefone_l
  mesAniversario: string | null; // mes_aniversario_l
  interesse: string | null;      // interesse_l
  rede: number | null;           // rede_l
  link: number | null;           // link_l
  dataCadastro: string;          // data_cadastro_l
  dataCarteira: string | null;   // data_carteira
  selecao: string | null;        // selecao
  usuario: string | null;        // id_usuario
  ativo: number;                 // ativo
}

export interface ILeadsPrincipalPage {
  data: ILeadsPrincipal[];
  totalCount: number;
}

// Interface para criação/edição de leads
export interface ILeadsForm {
  nome: string;
  telefone: string;
  email?: string;
  interesse?: string;
  mesAniversario?: string;
  rede?: number;
  usuario?: string;
  selecao?: string;
}

// Interface para os filtros de busca
export interface ILeadsFiltros {
  page: number;
  limit?: number;
  filter?: string;
  dataInicio?: string;
  dataFim?: string;
  selecao?: string;
  usuario?: string;
}

// ========================================
// COMENTÁRIOS DE LEADS (tabela separada)
// ========================================
export interface ILeadsComentarioForm {
  idLeads: number;
  telefone: string;
  texto: string;
  status: string;
  usuario?: string;
}

export interface ILeadsComentario extends ILeadsComentarioForm {
  id: number;
  data: Date;
  leads?: string;
}

// Mantém compatibilidade com código legado de comentários
export interface ILeads extends ILeadsComentarioForm {
  id: number;
  data: Date;
  leads?: string;
}

export interface ILeadsPage {
  data: ILeads[];
  totalCount: number;
}
