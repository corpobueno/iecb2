import { IAula, IAulaForm } from '../entities/IAula';

export default interface AulaRepository {
  find(ativo: number): Promise<IAula[]>;
  findDisponiveis(ativo: number): Promise<IAula[]>;
  getById(id: number): Promise<IAula | null>;
  create(data: IAulaForm): Promise<number>;
  update(id: number, data: Partial<IAula>): Promise<void>;
  delete(id: number): Promise<void>;
}
