import { IDiarioAluno, IDiarioAula, IDiarioFilters } from '../entities/IDiario';

export default interface DiarioRepository {
  getAulas(filters: IDiarioFilters): Promise<IDiarioAula[]>;
  getAlunos(idAula: number, status?: number, tipo?: number): Promise<IDiarioAluno[]>;
  getDocentes(dataInicio: string, dataFim: string, usuario?: string): Promise<{ id: string; nome: string }[]>;
  getUsuarios(dataInicio: string, dataFim: string, docente?: string): Promise<{ id: string }[]>;
}
