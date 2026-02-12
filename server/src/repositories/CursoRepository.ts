import { ICurso, ICursoForm } from '../entities/ICurso';

export default interface CursoRepository {
  find(ativo: number): Promise<ICurso[]>;
  getById(id: number): Promise<ICurso | null>;
  create(data: ICursoForm): Promise<number>;
  update(id: number, data: Partial<ICursoForm>): Promise<void>;
  delete(id: number): Promise<void>;
}
