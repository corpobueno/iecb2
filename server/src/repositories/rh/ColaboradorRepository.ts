import { IColaborador, IColaboradorForm, IColaboradorFilters } from '../../entities/rh';

export default interface ColaboradorRepository {
  find(filters: IColaboradorFilters): Promise<IColaborador[]>;
  getById(id: number, empresa: number): Promise<IColaborador | null>;
  create(data: IColaboradorForm): Promise<number>;
  update(id: number, data: Partial<IColaboradorForm>, empresa: number): Promise<void>;
  delete(id: number, empresa: number): Promise<void>;
  updateStatus(id: number, status: string, empresa: number): Promise<void>;
  updateScoreIntegracao(id: number, score: number, empresa: number): Promise<void>;
  countByEmpresa(empresa: number): Promise<number>;
  countByStatus(empresa: number, status: string): Promise<number>;
}
