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
