export interface IAgendaForm {
  idAula: number;
  data: string;
  hora: string;
  horaFim: string;
  status?: number;
  valor?: number;
  nota?: string;
  usuario: string;
}

export interface IAgenda extends IAgendaForm {
  id: number;
  ativo: number;
  // Campos de join
  nomeCurso?: string;
  docente?: string;
  nomeDocente?: string;
  color?: string;
  cursoColor?: string;
}

export interface IAgendaPage {
  data: IAgenda[];
  totalCount: number;
}
