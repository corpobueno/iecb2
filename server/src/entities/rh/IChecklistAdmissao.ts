// Interface para criação de item do checklist de admissão
export interface IChecklistAdmissaoForm {
  idColaborador: number;
  idTemplate?: number;
  item: string;
  concluido?: number;
  dataConclusao?: string;
  observacoes?: string;
  usuario?: string;
}

// Interface completa do item do checklist
export interface IChecklistAdmissao extends IChecklistAdmissaoForm {
  id: number;
  ativo: number;
  dataCadastro?: Date;
}

// Interface para atualização de status
export interface IChecklistAdmissaoUpdate {
  concluido: number;
  dataConclusao?: string;
  observacoes?: string;
  usuario?: string;
}

// Interface para listagem
export interface IChecklistAdmissaoPage {
  data: IChecklistAdmissao[];
  totalCount: number;
}

// Estatísticas do checklist
export interface IChecklistStats {
  total: number;
  concluidos: number;
  pendentes: number;
  percentualConcluido: number;
}
