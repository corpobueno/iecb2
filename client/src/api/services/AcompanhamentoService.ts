import { Api } from '../axios-config';
import { IAcompanhamento, IAcompanhamentoForm, IAcompanhamentoPage } from '../../entities/Iecb';
import { Environment } from '../axios-config/environment';

export const AcompanhamentoService = {
  find: async (page = 1, filter = ''): Promise<IAcompanhamentoPage | Error> => {
    try {
      const urlRelativa = `/acompanhamento?page=${page}&limit=${Environment.LIMITE_DE_LINHAS}&filter=${filter}`;
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

  getById: async (id: number): Promise<IAcompanhamento> => {
    const { data } = await Api.get(`/acompanhamento/${id}`);

    if (data) {
      return data;
    }

    throw new Error('Erro ao consultar o registro.');
  },

  create: async (dados: IAcompanhamentoForm): Promise<number> => {
    const { data } = await Api.post<{ id: number }>('/acompanhamento', dados);

    if (data) {
      return data.id;
    }

    throw new Error('Erro ao criar o registro.');
  },

  update: async (id: number, dados: Partial<IAcompanhamento>): Promise<void> => {
    await Api.put(`/acompanhamento/${id}`, dados);
  },

  deleteById: async (id: number): Promise<void | Error> => {
    try {
      await Api.delete(`/acompanhamento/${id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao deletar o registro.');
    }
  },
};
