import { IAnexo } from '../../entities/anexos/IAnexo';

export interface AnexosRepository {
  getById(id: number, empresa?: number): Promise<IAnexo | null>;
  getByReferencia(tabela: string, idRef: number, empresa?: number): Promise<IAnexo[]>;
  create(anexo: IAnexo): Promise<number>;
  delete(id: number, empresa?: number): Promise<boolean>;
}
