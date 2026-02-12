import { Api } from '../axios-config';
import { IAula, IAulaForm, IAulaPage } from '../../entities/Iecb';

export const AulaService = {
  find: async (ativo = 1): Promise<IAulaPage | Error> => {
    try {
      const { data } = await Api.get(`/aula?ativo=${ativo}`);

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

  findDisponiveis: async (ativo = 1): Promise<IAulaPage | Error> => {
    try {
      const { data } = await Api.get(`/aula/disponiveis?ativo=${ativo}`);

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

  getById: async (id: number): Promise<IAula> => {
    const { data } = await Api.get(`/aula/${id}`);

    if (data) {
      return data;
    }

    throw new Error('Erro ao consultar o registro.');
  },

  create: async (dados: IAulaForm): Promise<number> => {
    const { data } = await Api.post<{ id: number }>('/aula', dados);

    if (data) {
      return data.id;
    }

    throw new Error('Erro ao criar o registro.');
  },

  update: async (id: number, dados: Partial<IAula>): Promise<void> => {
    await Api.put(`/aula/${id}`, dados);
  },

  cancel: async (id: number): Promise<void> => {
    await Api.put(`/aula/${id}/cancel`);
  },

  deleteById: async (id: number): Promise<void | Error> => {
    try {
      await Api.delete(`/aula/${id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao deletar o registro.');
    }
  },
};
