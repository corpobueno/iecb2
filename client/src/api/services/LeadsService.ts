import { Api } from '../axios-config';
import { Environment } from '../axios-config/environment';
import { ILeads, ILeadsForm, ILeadsPage, ILeadsPrincipal, ILeadsPrincipalPage, ILeadsFiltros, ILeadsComentarioForm } from '../../entities/Iecb';

// Interface para status list (usada nos componentes)
export interface IStatusLeadsList {
  id: string;
  label: string;
  color: string;
  icon: string;
}

export const LeadsService = {
  find: async (page = 1, filter = ''): Promise<ILeadsPage | Error> => {
    try {
      const urlRelativa = `/leads?page=${page}&limit=${Environment.LIMITE_DE_LINHAS}&filter=${filter}`;
      const { data } = await Api.get(urlRelativa);

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

  getPrincipal: async (filtros: ILeadsFiltros): Promise<ILeadsPrincipalPage | Error> => {
    try {
      const params = new URLSearchParams();
      params.append('page', String(filtros.page || 1));
      if (filtros.limit) params.append('limit', String(filtros.limit));
      if (filtros.filter) params.append('filter', filtros.filter);
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      if (filtros.selecao) params.append('selecao', filtros.selecao);
      if (filtros.usuario) params.append('usuario', filtros.usuario);

      const { data } = await Api.get(`/leads/principal?${params.toString()}`);

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

  getComentarios: async (telefone: string): Promise<ILeads[] | Error> => {
    try {
      const { data } = await Api.get(`/leads/comentarios/${encodeURIComponent(telefone)}`);

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

  getById: async (id: number): Promise<ILeads> => {
    const { data } = await Api.get(`/leads/${id}`);

    if (data) {
      return data;
    }

    throw new Error('Erro ao consultar o registro.');
  },

  getLead: async (id: number): Promise<ILeadsPrincipal | Error> => {
    try {
      const { data } = await Api.get(`/leads/principal/${id}`);

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

  create: async (dados: Partial<ILeadsForm>): Promise<number | Error> => {
    try {
      const { data } = await Api.post<{ id: number }>('/leads', dados);

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

  createComentario: async (dados: Partial<ILeadsComentarioForm>): Promise<number | Error> => {
    try {
      const { data } = await Api.post<{ id: number }>('/leads/comentarios', dados);

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

  update: async (id: number, dados: Partial<ILeads>): Promise<void> => {
    await Api.put(`/leads/${id}`, dados);
  },

  deleteById: async (id: number): Promise<void | Error> => {
    try {
      await Api.delete(`/leads/${id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao deletar o registro.');
    }
  },
};

// Re-exportar tipos para compatibilidade
export type { ILeads, ILeadsForm, ILeadsPage, ILeadsPrincipal, ILeadsPrincipalPage, ILeadsFiltros, ILeadsComentarioForm };
