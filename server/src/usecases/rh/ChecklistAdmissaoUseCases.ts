import { IChecklistAdmissao, IChecklistAdmissaoForm, IChecklistAdmissaoUpdate, IChecklistStats } from '../../entities/rh';
import ChecklistAdmissaoRepository from '../../repositories/rh/ChecklistAdmissaoRepository';
import ColaboradorRepository from '../../repositories/rh/ColaboradorRepository';
import { AppError } from '../../utils/AppError';

export class ChecklistAdmissaoUseCases {
  constructor(
    private repository: ChecklistAdmissaoRepository,
    private colaboradorRepository: ColaboradorRepository
  ) {}

  async findByColaborador(idColaborador: number): Promise<IChecklistAdmissao[]> {
    return this.repository.findByColaborador(idColaborador);
  }

  async getById(id: number): Promise<IChecklistAdmissao> {
    const result = await this.repository.getById(id);
    if (!result) {
      throw new AppError('Item do checklist não encontrado', 404);
    }
    return result;
  }

  async create(data: IChecklistAdmissaoForm): Promise<number> {
    if (!data.item) {
      throw new AppError('Item é obrigatório', 400);
    }
    if (!data.idColaborador) {
      throw new AppError('Colaborador é obrigatório', 400);
    }
    return this.repository.create(data);
  }

  async update(id: number, data: IChecklistAdmissaoUpdate, empresa: number): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Item do checklist não encontrado', 404);
    }

    // Se marcando como concluído e não tem data de conclusão, usar data atual
    if (data.concluido === 1 && !data.dataConclusao) {
      data.dataConclusao = new Date().toISOString().split('T')[0];
    }

    // Se desmarcando, limpar data de conclusão
    if (data.concluido === 0) {
      data.dataConclusao = undefined;
    }

    await this.repository.update(id, data);

    // Recalcular score de integração do colaborador
    await this.recalcularScoreColaborador(existing.idColaborador, empresa);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Item do checklist não encontrado', 404);
    }
    return this.repository.delete(id);
  }

  async getStats(idColaborador: number): Promise<IChecklistStats> {
    return this.repository.getStats(idColaborador);
  }

  /**
   * Marca um item como concluído
   */
  async marcarConcluido(id: number, usuario: string, empresa: number): Promise<void> {
    await this.update(id, {
      concluido: 1,
      dataConclusao: new Date().toISOString().split('T')[0],
      usuario
    }, empresa);
  }

  /**
   * Desmarca um item como concluído
   */
  async desmarcarConcluido(id: number, usuario: string, empresa: number): Promise<void> {
    await this.update(id, {
      concluido: 0,
      usuario
    }, empresa);
  }

  /**
   * Recalcula o score de integração do colaborador
   */
  private async recalcularScoreColaborador(idColaborador: number, empresa: number): Promise<void> {
    const stats = await this.repository.getStats(idColaborador);
    await this.colaboradorRepository.updateScoreIntegracao(
      idColaborador,
      stats.percentualConcluido,
      empresa
    );
  }
}
