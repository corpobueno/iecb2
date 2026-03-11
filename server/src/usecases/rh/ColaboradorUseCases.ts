import { IColaborador, IColaboradorForm, IColaboradorFilters, IChecklistAdmissaoForm } from '../../entities/rh';
import ColaboradorRepository from '../../repositories/rh/ColaboradorRepository';
import ChecklistTemplateRepository from '../../repositories/rh/ChecklistTemplateRepository';
import ChecklistAdmissaoRepository from '../../repositories/rh/ChecklistAdmissaoRepository';
import { AppError } from '../../utils/AppError';

export class ColaboradorUseCases {
  constructor(
    private repository: ColaboradorRepository,
    private checklistTemplateRepository: ChecklistTemplateRepository,
    private checklistAdmissaoRepository: ChecklistAdmissaoRepository
  ) {}

  async find(filters: IColaboradorFilters): Promise<IColaborador[]> {
    return this.repository.find(filters);
  }

  async getById(id: number, empresa: number): Promise<IColaborador> {
    const result = await this.repository.getById(id, empresa);
    if (!result) {
      throw new AppError('Colaborador não encontrado', 404);
    }
    return result;
  }

  async create(data: IColaboradorForm): Promise<number> {
    if (!data.nome) {
      throw new AppError('Nome é obrigatório', 400);
    }
    if (!data.empresa) {
      throw new AppError('Empresa é obrigatória', 400);
    }

    // Criar o colaborador
    const colaboradorId = await this.repository.create(data);

    // Gerar checklist de admissão baseado nos templates
    await this.gerarChecklistAdmissao(colaboradorId, data.empresa, data.setor || null, data.usuario);

    return colaboradorId;
  }

  async update(id: number, data: Partial<IColaboradorForm>, empresa: number): Promise<void> {
    const existing = await this.repository.getById(id, empresa);
    if (!existing) {
      throw new AppError('Colaborador não encontrado', 404);
    }
    return this.repository.update(id, data, empresa);
  }

  async delete(id: number, empresa: number): Promise<void> {
    const existing = await this.repository.getById(id, empresa);
    if (!existing) {
      throw new AppError('Colaborador não encontrado', 404);
    }
    return this.repository.delete(id, empresa);
  }

  async updateStatus(id: number, status: string, empresa: number): Promise<void> {
    const existing = await this.repository.getById(id, empresa);
    if (!existing) {
      throw new AppError('Colaborador não encontrado', 404);
    }

    const validStatuses = ['ATIVO', 'FERIAS', 'AFASTADO', 'DESLIGADO'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Status inválido', 400);
    }

    return this.repository.updateStatus(id, status, empresa);
  }

  /**
   * Gera os itens do checklist de admissão para um colaborador
   * baseado nos templates configurados para a empresa e setor
   */
  private async gerarChecklistAdmissao(
    idColaborador: number,
    empresa: number,
    setor: string | null,
    usuario?: string
  ): Promise<void> {
    // Buscar templates aplicáveis (gerais + do setor)
    const templates = await this.checklistTemplateRepository.findBySetor(empresa, setor);

    if (templates.length === 0) {
      return; // Sem templates configurados
    }

    // Criar itens do checklist
    const items: IChecklistAdmissaoForm[] = templates.map(template => ({
      idColaborador,
      idTemplate: template.id,
      item: template.item,
      concluido: 0,
      usuario
    }));

    await this.checklistAdmissaoRepository.createMany(items);
  }

  /**
   * Recalcula o score de integração de um colaborador
   * baseado no checklist de admissão
   */
  async recalcularScoreIntegracao(id: number, empresa: number): Promise<number> {
    const existing = await this.repository.getById(id, empresa);
    if (!existing) {
      throw new AppError('Colaborador não encontrado', 404);
    }

    const stats = await this.checklistAdmissaoRepository.getStats(id);
    const score = stats.percentualConcluido;

    await this.repository.updateScoreIntegracao(id, score, empresa);
    return score;
  }

  /**
   * Retorna estatísticas gerais de colaboradores
   */
  async getStats(empresa: number) {
    const total = await this.repository.countByEmpresa(empresa);
    const ativos = await this.repository.countByStatus(empresa, 'ATIVO');
    const ferias = await this.repository.countByStatus(empresa, 'FERIAS');
    const afastados = await this.repository.countByStatus(empresa, 'AFASTADO');

    return {
      total,
      ativos,
      ferias,
      afastados
    };
  }
}
