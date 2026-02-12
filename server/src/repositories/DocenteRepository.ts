import { IDocente, IDocenteForm } from '../entities/IDocente';

export default interface DocenteRepository {
  find(ativo: number): Promise<IDocente[]>;
  getById(id: number): Promise<IDocente | null>;
  create(data: IDocenteForm): Promise<number>;
  update(id: number, data: Partial<IDocenteForm>): Promise<void>;
  delete(id: number): Promise<void>;
}
