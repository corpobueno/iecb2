// Interface para criação/edição de template de checklist
export interface IChecklistTemplateForm {
  empresa: number;
  setor?: string;
  item: string;
  ordem?: number;
  obrigatorio?: number;
  usuario?: string;
}

// Interface completa do template
export interface IChecklistTemplate extends IChecklistTemplateForm {
  id: number;
  ativo: number;
  dataCadastro?: Date;
}

// Interface para listagem
export interface IChecklistTemplatePage {
  data: IChecklistTemplate[];
  totalCount: number;
}

// Filtros para busca
export interface IChecklistTemplateFilters {
  empresa: number;
  setor?: string;
  ativo?: number;
}
