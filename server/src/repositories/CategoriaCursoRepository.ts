import { ICategoriaCurso } from '../entities/ICategoriaCurso';

export default interface CategoriaCursoRepository {
  find(): Promise<ICategoriaCurso[]>;
  getById(id: number): Promise<ICategoriaCurso | null>;
}
