export interface IDiarioAluno {
  id: number;
  idAluno: number;
  idAula: number;
  data: string;
  usuario: string;
  valor: number;
  tipo: number; // 1 = Aluna, 2 = Modelo
  status: number; // 0 = Agendado, 1 = Pago
  ativo: number;
  nomeAluno: string;
}

export interface IDiarioAula {
  id: number;
  idCurso: number;
  valor: number;
  docente: string;
  nota: string;
  usuario: string;
  data: string;
  nomeCurso: string;
  rateioModelo: number;
  color: string;
  nomeDocente: string;
  rateio: number;
  rateioRegular: number;
  soma: number;
  count: number;
  alunos: IDiarioAluno[];
}

export interface IDiarioFilters {
  dataInicio: string;
  dataFim: string;
  docente?: string;
  usuario?: string;
  status?: number;
  tipo?: number;
}

export interface IDiarioResponse {
  users: { id: string }[];
  docentes: { id: string; nome: string }[];
  itens: IDiarioAula[];
}
