export interface ILeadsForm {
  nome: string;
  email?: string;
  telefone?: string;
  interesse?: string;
  selecao?: number;
  idUsuario?: string;
  tentativas?: number;
  nota?: string;
}

export interface ILeads extends ILeadsForm {
  id: number;
  dataCadastro: Date;
  ativo: number;
}

export interface ILeadsPage {
  data: ILeads[];
  totalCount: number;
}
