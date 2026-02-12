import { Api } from '../axios-config';
import { ICurso, ICursoForm, ICursoPage } from '../../entities/Iecb';

export const CursoService = {
  find: async (ativo = 1): Promise<ICursoPage | Error> => {
    try {
      const { data } = await Api.get(`/curso?ativo=${ativo}`);

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

  getById: async (id: number): Promise<ICurso> => {
    const { data } = await Api.get(`/curso/${id}`);

    if (data) {
      return data;
    }

    throw new Error('Erro ao consultar o registro.');
  },

  create: async (dados: ICursoForm): Promise<number> => {
    const { data } = await Api.post<{ id: number }>('/curso', dados);

    if (data) {
      return data.id;
    }

    throw new Error('Erro ao criar o registro.');
  },

  update: async (id: number, dados: Partial<ICurso>): Promise<void> => {
    await Api.put(`/curso/${id}`, dados);
  },

  deleteById: async (id: number): Promise<void | Error> => {
    try {
      await Api.delete(`/curso/${id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao deletar o registro.');
    }
  },
};
