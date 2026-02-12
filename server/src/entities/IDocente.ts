export interface IDocenteForm {
  login: string;
  nome: string;
  color?: string;
  rateio?: number;
  rateioRegular?: number;
}

export interface IDocente extends IDocenteForm {
  id: number;
  ativo: number;
}

export interface IDocentePage {
  data: IDocente[];
  totalCount: number;
}
