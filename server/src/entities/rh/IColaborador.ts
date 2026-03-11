// Status do colaborador
export type ColaboradorStatus = 'ATIVO' | 'FERIAS' | 'AFASTADO' | 'DESLIGADO';

// Tipo de contrato
export type TipoContrato = 'CLT' | 'PJ' | 'ESTAGIO' | 'TEMPORARIO';

// Gênero
export type Genero = 'M' | 'F' | 'O';

// Status do período de experiência
export type ExperienciaStatus = 'PENDENTE' | 'APROVADO' | 'REPROVADO';

// Interface para criação/edição de colaborador
export interface IColaboradorForm {
  empresa: number;

  // Dados Pessoais
  nome: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  genero?: Genero;
  estadoCivil?: string;

  // Contato
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;

  // Profissional
  cargo?: string;
  setor?: string;
  dataAdmissao?: string;
  dataDemissao?: string;
  tipoContrato?: TipoContrato;
  salario?: number;

  // Período de Experiência
  experienciaInicio?: string;
  experienciaFim?: string;
  experienciaStatus?: ExperienciaStatus;

  // Status
  status?: ColaboradorStatus;

  // Integração Score (0-100)
  scoreIntegracao?: number;

  // Controle
  usuario?: string;
}

// Interface completa do colaborador (com campos de controle)
export interface IColaborador extends IColaboradorForm {
  id: number;
  ativo: number;
  dataCadastro?: Date;
  dataAtt?: Date;
}

// Interface para listagem paginada
export interface IColaboradorPage {
  data: IColaborador[];
  totalCount: number;
}

// Filtros para busca de colaboradores
export interface IColaboradorFilters {
  empresa: number;
  status?: ColaboradorStatus;
  setor?: string;
  search?: string;
  ativo?: number;
}
