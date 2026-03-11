// =============================================
// COLABORADOR
// =============================================

export type ColaboradorStatus = 'ATIVO' | 'FERIAS' | 'AFASTADO' | 'DESLIGADO';
export type TipoContrato = 'CLT' | 'PJ' | 'ESTAGIO' | 'TEMPORARIO';
export type Genero = 'M' | 'F' | 'O';
export type ExperienciaStatus = 'PENDENTE' | 'APROVADO' | 'REPROVADO';

export interface IColaboradorForm {
  nome: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  genero?: Genero;
  estadoCivil?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cargo?: string;
  setor?: string;
  dataAdmissao?: string;
  dataDemissao?: string;
  tipoContrato?: TipoContrato;
  salario?: number;
  experienciaInicio?: string;
  experienciaFim?: string;
  experienciaStatus?: ExperienciaStatus;
  status?: ColaboradorStatus;
}

export interface IColaborador extends IColaboradorForm {
  id: number;
  empresa: number;
  scoreIntegracao: number;
  ativo: number;
  usuario?: string;
  dataCadastro?: string;
  dataAtt?: string;
}

export interface IColaboradorPage {
  data: IColaborador[];
  totalCount: number;
}

export interface IColaboradorStats {
  total: number;
  ativos: number;
  ferias: number;
  afastados: number;
}

// =============================================
// CHECKLIST TEMPLATE
// =============================================

export interface IChecklistTemplateForm {
  setor?: string;
  item: string;
  ordem?: number;
  obrigatorio?: number;
}

export interface IChecklistTemplate extends IChecklistTemplateForm {
  id: number;
  empresa: number;
  ativo: number;
  usuario?: string;
  dataCadastro?: string;
}

export interface IChecklistTemplatePage {
  data: IChecklistTemplate[];
  totalCount: number;
}

// =============================================
// CHECKLIST ADMISSÃO
// =============================================

export interface IChecklistAdmissaoForm {
  idColaborador: number;
  item: string;
}

export interface IChecklistAdmissao extends IChecklistAdmissaoForm {
  id: number;
  idTemplate?: number;
  concluido: number;
  dataConclusao?: string;
  observacoes?: string;
  ativo: number;
  usuario?: string;
  dataCadastro?: string;
}

export interface IChecklistAdmissaoPage {
  data: IChecklistAdmissao[];
  totalCount: number;
}

export interface IChecklistStats {
  total: number;
  concluidos: number;
  pendentes: number;
  percentualConcluido: number;
}

// =============================================
// OPÇÕES DE SELECT
// =============================================

export const STATUS_COLABORADOR_OPTIONS = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'FERIAS', label: 'Férias' },
  { value: 'AFASTADO', label: 'Afastado' },
  { value: 'DESLIGADO', label: 'Desligado' },
];

export const TIPO_CONTRATO_OPTIONS = [
  { value: 'CLT', label: 'CLT' },
  { value: 'PJ', label: 'PJ' },
  { value: 'ESTAGIO', label: 'Estágio' },
  { value: 'TEMPORARIO', label: 'Temporário' },
];

export const GENERO_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
  { value: 'O', label: 'Outro' },
];

export const ESTADO_CIVIL_OPTIONS = [
  { value: 'Solteiro(a)', label: 'Solteiro(a)' },
  { value: 'Casado(a)', label: 'Casado(a)' },
  { value: 'Divorciado(a)', label: 'Divorciado(a)' },
  { value: 'Viúvo(a)', label: 'Viúvo(a)' },
  { value: 'União Estável', label: 'União Estável' },
];

export const EXPERIENCIA_STATUS_OPTIONS = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'REPROVADO', label: 'Reprovado' },
];

export const ESTADOS_BR = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];
