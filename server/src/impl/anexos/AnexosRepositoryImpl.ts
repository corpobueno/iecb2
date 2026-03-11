import db from '../../db';
import { AnexosRepository } from '../../repositories/anexos/AnexosRepository';
import { IAnexo } from '../../entities/anexos/IAnexo';

const TABLE_NAME = 'anexos';

export class AnexosRepositoryImpl implements AnexosRepository {
  async getById(id: number, empresa?: number): Promise<IAnexo | null> {
    let query = db(TABLE_NAME).where('id', id);

    if (empresa) {
      query = query.where('empresa', empresa);
    }

    const result = await query.first();
    return result || null;
  }

  async getByReferencia(tabela: string, idRef: number, empresa?: number): Promise<IAnexo[]> {
    let query = db(TABLE_NAME)
      .where('tabela', tabela)
      .where('id_ref', idRef)
      .orderBy('created_at', 'desc');

    if (empresa) {
      query = query.where('empresa', empresa);
    }

    return await query;
  }

  async create(anexo: IAnexo): Promise<number> {
    const [id] = await db(TABLE_NAME).insert({
      nome: anexo.nome,
      tipo: anexo.tipo,
      tabela: anexo.tabela,
      id_ref: anexo.id_ref,
      empresa: anexo.empresa,
      url: anexo.url,
      formato: anexo.formato,
      usuario: anexo.usuario || null
    });

    return id;
  }

  async delete(id: number, empresa?: number): Promise<boolean> {
    let query = db(TABLE_NAME).where('id', id);

    if (empresa) {
      query = query.where('empresa', empresa);
    }

    const deleted = await query.delete();
    return deleted > 0;
  }
}
