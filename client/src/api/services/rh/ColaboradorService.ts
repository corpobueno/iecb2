import { Api } from '../../axios-config';
import { IColaborador, IColaboradorForm, IColaboradorPage, IColaboradorStats, ColaboradorStatus } from '../../../entities/Rh';

interface IColaboradorFilters {
  status?: ColaboradorStatus;
  setor?: string;
  search?: string;
  ativo?: number;
}

export const ColaboradorService = {
  find: async (filters?: IColaboradorFilters): Promise<IColaboradorPage | Error> => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.setor) params.append('setor', filters.setor);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.ativo !== undefined) params.append('ativo', String(filters.ativo));

      const { data } = await Api.get(`/rh/colaborador?${params.toString()}`);

      if (data) {
        return {
          data,
          totalCount: data.length,
        };
      }

      return new Error('Erro ao listar os registros.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao listar os registros.');
    }
  },

  getById: async (id: number): Promise<IColaborador | Error> => {
    try {
      const { data } = await Api.get(`/rh/colaborador/${id}`);

      if (data) {
        return data;
      }

      return new Error('Erro ao consultar o registro.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao consultar o registro.');
    }
  },

  create: async (dados: IColaboradorForm): Promise<number | Error> => {
    try {
      const { data } = await Api.post<{ id: number }>('/rh/colaborador', dados);

      if (data) {
        return data.id;
      }

      return new Error('Erro ao criar o registro.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao criar o registro.');
    }
  },

  update: async (id: number, dados: Partial<IColaboradorForm>): Promise<void | Error> => {
    try {
      await Api.put(`/rh/colaborador/${id}`, dados);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao atualizar o registro.');
    }
  },

  deleteById: async (id: number): Promise<void | Error> => {
    try {
      await Api.delete(`/rh/colaborador/${id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao deletar o registro.');
    }
  },

  updateStatus: async (id: number, status: ColaboradorStatus): Promise<void | Error> => {
    try {
      await Api.patch(`/rh/colaborador/${id}/status`, { status });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao atualizar status.');
    }
  },

  getStats: async (): Promise<IColaboradorStats | Error> => {
    try {
      const { data } = await Api.get('/rh/colaborador/stats');

      if (data) {
        return data;
      }

      return new Error('Erro ao buscar estatísticas.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao buscar estatísticas.');
    }
  },

  recalcularScore: async (id: number): Promise<number | Error> => {
    try {
      const { data } = await Api.patch(`/rh/colaborador/${id}/recalcular-score`);

      if (data) {
        return data.score;
      }

      return new Error('Erro ao recalcular score.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao recalcular score.');
    }
  },
};
