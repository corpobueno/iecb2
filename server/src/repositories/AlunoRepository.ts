import { IAluno, IAlunoForm } from '../entities/IAluno';

export default interface AlunoRepository {
  findByAula(idAula: number, ativo: number): Promise<IAluno[]>;
  findByAulaAndData(idAula: number, data: string): Promise<IAluno[]>;
  getById(id: number): Promise<IAluno | null>;
  create(data: IAlunoForm): Promise<number>;
  update(id: number, data: Partial<IAlunoForm>): Promise<void>;
  updateStatus(id: number, status: number): Promise<void>;
  delete(id: number): Promise<void>;
  sumValorByAula(idAula: number): Promise<number>;
}
