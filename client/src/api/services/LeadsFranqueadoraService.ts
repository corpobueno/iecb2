import { Api } from '../axios-config';
import {
  ILeadsFranqueadora,
  ILeadsFranqueadoraForm,
  ILeadsFranqueadoraPage,
  ILeadsFranqueadoraFiltros,
  ILeadsFranqueadoraComentarioForm,
  ILeadsFranqueadoraComentario
} from '../../entities/Iecb';

export const LeadsFranqueadoraService = {
  find: async (page = 1, filter = ''): Promise<ILeadsFranqueadoraPage | Error> => {
    try {
      const { data } = await Api.get(`/leads-franqueadora?page=${page}&filter=${filter}`);

      if (data) {
        return {
          data: data.data,
          totalCount: data.totalCount,
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

  getPrincipal: async (filtros: ILeadsFranqueadoraFiltros): Promise<ILeadsFranqueadoraPage | Error> => {
    try {
      const params = new URLSearchParams();
      params.append('page', String(filtros.page || 1));
      if (filtros.limit) params.append('limit', String(filtros.limit));
      if (filtros.filter) params.append('filter', filtros.filter);
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.user) params.append('user', filtros.user);

      const { data } = await Api.get(`/leads-franqueadora/principal?${params.toString()}`);

      if (data) {
        return {
          data: data.data,
          totalCount: data.totalCount,
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

  getComentarios: async (telefone: string): Promise<ILeadsFranqueadoraComentario[] | Error> => {
    try {
      const { data } = await Api.get(`/leads-franqueadora/comentarios/${encodeURIComponent(telefone)}`);

      if (data) {
        return data;
      }

      return new Error('Erro ao buscar comentários.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao buscar comentários.');
    }
  },

  getById: async (id: number): Promise<ILeadsFranqueadora> => {
    const { data } = await Api.get(`/leads-franqueadora/${id}`);

    if (data) {
      return data;
    }

    throw new Error('Erro ao consultar o registro.');
  },

  getLead: async (id: number): Promise<ILeadsFranqueadora | Error> => {
    try {
      const { data } = await Api.get(`/leads-franqueadora/principal/${id}`);

      if (data) {
        return data;
      }

      return new Error('Erro ao consultar o lead.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao consultar o lead.');
    }
  },

  create: async (dados: Partial<ILeadsFranqueadoraForm>): Promise<number | Error> => {
    try {
      const { data } = await Api.post<{ id: number }>('/leads-franqueadora', dados);

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

  createComentario: async (dados: Partial<ILeadsFranqueadoraComentarioForm>): Promise<number | Error> => {
    try {
      const { data } = await Api.post<{ id: number }>('/leads-franqueadora/comentarios', dados);

      if (data) {
        return data.id;
      }

      return new Error('Erro ao criar comentário.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao criar comentário.');
    }
  },

  update: async (id: number, dados: Partial<ILeadsFranqueadora>): Promise<void> => {
    await Api.put(`/leads-franqueadora/${id}`, dados);
  },

  deleteById: async (id: number): Promise<void | Error> => {
    try {
      await Api.delete(`/leads-franqueadora/${id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao deletar o registro.');
    }
  },
};

export type {
  ILeadsFranqueadora,
  ILeadsFranqueadoraForm,
  ILeadsFranqueadoraPage,
  ILeadsFranqueadoraFiltros,
  ILeadsFranqueadoraComentarioForm,
  ILeadsFranqueadoraComentario
};
