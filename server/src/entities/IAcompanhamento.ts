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
