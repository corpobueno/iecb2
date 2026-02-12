import { Api } from '../axios-config';
import { ILeads, ILeadsForm, ILeadsPage } from '../../entities/Iecb';
import { Environment } from '../axios-config/environment';

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

  getById: async (id: number): Promise<ILeads> => {
    const { data } = await Api.get(`/leads/${id}`);

    if (data) {
      return data;
    }

    throw new Error('Erro ao consultar o registro.');
  },

  create: async (dados: ILeadsForm): Promise<number> => {
    const { data } = await Api.post<{ id: number }>('/leads', dados);

    if (data) {
      return data.id;
    }

    throw new Error('Erro ao criar o registro.');
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
