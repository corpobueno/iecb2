import { AnexosRepository } from '../../repositories/anexos/AnexosRepository';
import { IAnexo, IAnexoCreate } from '../../entities/anexos/IAnexo';
import { uploadBase64ToMinio, deleteFromMinio } from '../../utils/minioClient';

export class AnexosUseCases {
  constructor(private readonly anexosRepository: AnexosRepository) {}

  async getById(id: number, empresa?: number): Promise<IAnexo | null> {
    return await this.anexosRepository.getById(id, empresa);
  }

  async getByReferencia(tabela: string, idRef: number, empresa?: number): Promise<IAnexo[]> {
    if (!tabela || tabela.trim() === '') {
      throw new Error('Tabela é obrigatória');
    }

    if (!idRef) {
      throw new Error('ID de referência é obrigatório');
    }

    return await this.anexosRepository.getByReferencia(tabela, idRef, empresa);
  }

  async create(anexo: IAnexoCreate): Promise<number> {
    if (!anexo.base64) {
      throw new Error('base64 é obrigatório');
    }

    if (!anexo.nome || anexo.nome.trim() === '') {
      throw new Error('Nome é obrigatório');
    }

    if (!anexo.tipo || anexo.tipo.trim() === '') {
      throw new Error('Tipo é obrigatório');
    }

    if (!anexo.tabela || anexo.tabela.trim() === '') {
      throw new Error('Tabela é obrigatória');
    }

    // Upload para MinIO
    const url = await uploadBase64ToMinio(anexo.base64, anexo.formato || 'jpg');

    const anexoData: IAnexo = {
      nome: anexo.nome.trim(),
      tipo: anexo.tipo.trim(),
      tabela: anexo.tabela.trim(),
      id_ref: anexo.id_ref || null,
      empresa: anexo.empresa || null,
      url: url,
      formato: anexo.formato || null,
      usuario: anexo.usuario || null
    };

    return await this.anexosRepository.create(anexoData);
  }

  async delete(id: number, empresa?: number): Promise<boolean> {
    if (!id) {
      throw new Error('ID do anexo é obrigatório');
    }

    // Busca o anexo para obter a URL do arquivo
    const anexo = await this.anexosRepository.getById(id, empresa);
    if (!anexo) {
      return false;
    }

    // Deleta do banco
    const deleted = await this.anexosRepository.delete(id, empresa);

    // Se deletou do banco, tenta deletar do MinIO
    if (deleted && anexo.url) {
      try {
        await deleteFromMinio(anexo.url);
      } catch (error) {
        console.error('Erro ao deletar arquivo do MinIO:', error);
        // Não falha a operação se não conseguir deletar do MinIO
      }
    }

    return deleted;
  }
}
