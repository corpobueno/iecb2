// ========================================
// ACOMPANHAMENTO (Leads/Clientes)
// ========================================
export interface IAcompanhamentoForm {
  idLeads?: number | null;
  nome: string;
  telefone: string;
  email?: string;
  endereco?: string;
  dataNascimento?: string;
  interesse?: string;
  usuario?: string;
  nota?: string;
  status?: number;
}

export interface IAcompanhamento extends IAcompanhamentoForm {
  id: number;
  dataCadastro: Date;
  dataAtt: Date;
  ativo: number;
}

export interface IAcompanhamentoPage {
  data: IAcompanhamento[];
  totalCount: number;
}

// ========================================
// CURSOS
// ========================================
export interface ICursoForm {
  nome: string;
  categoria?: string;
  status?: number;
  valor?: number;
  vip?: number;
  grupo?: number;
  color?: string;
  duracao?: string;
  qnt?: number;
  rateioModelo?: number;
}

export interface ICurso extends ICursoForm {
  id: number;
  ativo: number;
}

export interface ICursoPage {
  data: ICurso[];
  totalCount: number;
}

// ========================================
// DOCENTES
// ========================================
export interface IDocenteForm {
  login: string;
  nome: string;
  color?: string;
  rateio?: number;
  rateioRegular?: number;
  ativo?: number;
}

export interface IDocente extends IDocenteForm {
  id: number;
  ativo: number;
}

export interface IDocentePage {
  data: IDocente[];
  totalCount: number;
}

// ========================================
// AULAS
// ========================================
export interface IAulaForm {
  idCurso: number;
  valor: number;
  qnt?: number;
  docente: string;
  nota?: string;
  usuario?: string;
}

export interface IAula extends IAulaForm {
  id: number;
  dataAgendado: Date;
  ativo: number;
  // Campos de join
  nomeCurso?: string;
  nomeDocente?: string;
  color?: string;
}

export interface IAulaPage {
  data: IAula[];
  totalCount: number;
}

// ========================================
// AGENDA
// ========================================
export interface IAgendaForm {
  idAula: number;
  data: string;
  hora: string;
  horaFim: string;
  status?: number;
  valor?: number;
  nota?: string;
  usuario?: string;
}

export interface IAgenda extends IAgendaForm {
  id: number;
  ativo: number;
  // Campos de join
  nomeCurso?: string;
  docente?: string;
  nomeDocente?: string;
  color?: string;
  cursoColor?: string;
}

export interface IAgendaPage {
  data: IAgenda[];
  totalCount: number;
}

// ========================================
// ALUNOS (Matrículas)
// ========================================
export interface IAlunoForm {
  idAluno: number;
  idAula: number;
  tipo?: number;
  status?: number;
  valor?: number;
  valorMatricula?: number;
  data?: string;
  usuario?: string;
}

export interface IAluno extends IAlunoForm {
  id: number;
  dataCadastro: Date;
  ativo: number;
  // Campos de join
  nomeAluno?: string;
  telefone?: string;
}

export interface IAlunoPage {
  data: IAluno[];
  totalCount: number;
}

// ========================================
// PAGAMENTOS
// ========================================
export interface IPagamentoForm {
  idCliente: number;
  idAula?: number;
  idAluno?: number;
  idLancamentos?: number;
  docente?: string;
  caixa: string;
  valor: number;
  valorMatricula?: number;
  idPagamento?: number;
  qnt?: number;
}

export interface IPagamento extends IPagamentoForm {
  id: number;
  data: Date;
  ativo: number;
  // Campos de join
  nomeCliente?: string;
  nomeCurso?: string;
}

export interface IPagamentoPage {
  data: IPagamento[];
  totalCount: number;
}

// ========================================
// LEADS IECB (tabela leads_iecb)
// ========================================

// Interface principal para leads_iecb
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

// Interface para os filtros de busca de leads
export interface ILeadsFiltros {
  page: number;
  limit?: number;
  filter?: string;
  data_inicio?: string;
  data_fim?: string;
  selecao?: string;
  usuario?: string;
}

// ========================================
// COMENTÁRIOS DE LEADS (tabela separada)
// ========================================
export interface ILeadsComentarioForm {
  idLeads: number;
  leads: string;
  telefone: string;
  texto: string;
  status: string;
  usuario?: string;
}

export interface ILeadsComentario extends ILeadsComentarioForm {
  id: number;
  data: Date;
}

// Mantém compatibilidade com código legado
export interface ILeads extends ILeadsComentarioForm {
  id: number;
  data: Date;
}

export interface ILeadsPage {
  data: ILeads[];
  totalCount: number;
}

// ========================================
// LEADS FRANQUEADORA (tabela leads_franquiados)
// ========================================

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

export interface ILeadsFranqueadoraFiltros {
  page: number;
  limit?: number;
  filter?: string;
  data_inicio?: string;
  data_fim?: string;
  status?: string;
  user?: string;
}

export interface ILeadsFranqueadoraComentarioForm {
  idLeads: number;
  telefone: string;
  nota: string;
  status: string;
  user?: string;
  tabela: string;
}

export interface ILeadsFranqueadoraComentario extends ILeadsFranqueadoraComentarioForm {
  id: number;
  data: Date;
}

// ========================================
// TIPOS AUXILIARES
// ========================================
export interface IPagamentoProcessar {
  idCliente: number;
  idAula: number;
  idAluno: number;
  docente: string;
  pagamentos: Array<{
    idPagamento: number;
    valor: number;
    qnt: number;
  }>;
  valorPendente: number;
}

// ========================================
// CAIXA DE PAGAMENTOS
// ========================================
export interface ICaixaPagamentoFiltros {
  data_inicio: string;
  data_fim: string;
  caixa?: string;
  docente?: string;
}

export interface IFormaPagamentoAgrupado {
  idPagamento: number;
  nome: string;
  total: number;
  count: number;
}

export interface ICaixaPagamentoResult {
  pagamentos: IFormaPagamentoAgrupado[];
  bonificacoes: IFormaPagamentoAgrupado[];
  sumPagamentos: number;
  sumBonificacoes: number;
}

export interface ICaixaFiltrosOptions {
  caixas: Array<{ id: string; label: string }>;
  docentes: Array<{ id: string; label: string }>;
}

export interface ICaixaDetalhesFiltros extends ICaixaPagamentoFiltros {
  idPagamento: number;
}

export interface IPagamentoDetalhe {
  id: number;
  data: Date;
  valor: number;
  qnt: number;
  nomeCliente: string;
  nomeCurso: string;
  docente: string;
  caixa: string;
}

// ========================================
// DIÁRIO
// ========================================
export interface IDiarioAluno {
  id: number;
  idAluno: number;
  idAula: number;
  data: string;
  usuario: string;
  valor: number;
  tipo: number; // 1 = Aluna, 2 = Modelo
  status: number; // 0 = Agendado, 1 = Pago
  ativo: number;
  nomeAluno: string;
}

export interface IDiarioAula {
  id: number;
  idCurso: number;
  valor: number;
  docente: string;
  nota: string;
  usuario: string;
  data: string;
  nomeCurso: string;
  rateioModelo: number;
  color: string;
  nomeDocente: string;
  rateio: number;
  rateioRegular: number;
  soma: number;
  count: number;
  alunos: IDiarioAluno[];
}

export interface IDiarioFilters {
  dataInicio: string;
  dataFim: string;
  docente?: string;
  usuario?: string;
  status?: number;
  tipo?: number;
}

export interface IDiarioResponse {
  users: { id: string }[];
  docentes: { id: string; nome: string }[];
  itens: IDiarioAula[];
}
