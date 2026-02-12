export interface IAulaForm {
  idCurso: number;
  valor: number;
  qnt?: number;
  docente: string;
  nota?: string;
  usuario: string;
}

export interface IAula extends IAulaForm {
  id: number;
  dataAgendado: Date;
  ativo: number;
  // Campos de join
  nomeCurso?: string;
  nomeDocente?: string;
  color?: string;
}

export interface IAulaPage {
  data: IAula[];
  totalCount: number;
}
