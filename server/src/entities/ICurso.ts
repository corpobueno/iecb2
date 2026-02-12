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
