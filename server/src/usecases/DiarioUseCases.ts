import { IDiarioFilters, IDiarioResponse } from '../entities/IDiario';
import DiarioRepository from '../repositories/DiarioRepository';
import { AppError } from '../utils/AppError';

export class DiarioUseCases {
  constructor(private repository: DiarioRepository) {}

  async getDiario(filters: IDiarioFilters): Promise<IDiarioResponse> {
    if (!filters.dataInicio || !filters.dataFim) {
      throw new AppError('Data início e fim são obrigatórias', 400);
    }

    const [aulas, docentes, users] = await Promise.all([
      this.repository.getAulas(filters),
      this.repository.getDocentes(filters.dataInicio, filters.dataFim, filters.usuario),
      this.repository.getUsuarios(filters.dataInicio, filters.dataFim, filters.docente),
    ]);

    // Load students for each class
    const itens = await Promise.all(
      aulas.map(async (aula) => ({
        ...aula,
        alunos: await this.repository.getAlunos(
          aula.id,
          filters.status,
          filters.tipo
        ),
      }))
    );

    return {
      users,
      docentes,
      itens,
    };
  }
}
