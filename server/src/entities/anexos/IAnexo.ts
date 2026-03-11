export interface IAnexo {
  id?: number;
  nome: string;
  tipo: string;
  tabela: string;
  id_ref: number | null;
  empresa: number | null;
  url: string | null;
  formato: string | null;
  usuario?: string | null;
  created_at?: Date;
}

export interface IAnexoCreate {
  nome: string;
  tipo: string;
  tabela: string;
  id_ref: number | null;
  empresa: number | null;
  base64: string;
  formato: string | null;
  usuario?: string | null;
}

export interface IAnexosFilters {
  page?: number;
  limit?: number;
  tabela?: string;
  id_ref?: number;
  tipo?: string;
  empresa: number;
}
