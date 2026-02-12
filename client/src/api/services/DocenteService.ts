import { Api } from '../axios-config';
import { IDocente, IDocenteForm, IDocentePage } from '../../entities/Iecb';

export const DocenteService = {
  find: async (ativo = 1): Promise<IDocentePage | Error> => {
    try {
      const { data } = await Api.get(`/docente?ativo=${ativo}`);

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

  getById: async (id: number): Promise<IDocente> => {
    const { data } = await Api.get(`/docente/${id}`);

    if (data) {
      return data;
    }

    throw new Error('Erro ao consultar o registro.');
  },

  create: async (dados: IDocenteForm): Promise<number> => {
    const { data } = await Api.post<{ id: number }>('/docente', dados);

    if (data) {
      return data.id;
    }

    throw new Error('Erro ao criar o registro.');
  },

  update: async (id: number, dados: Partial<IDocente>): Promise<void> => {
    await Api.put(`/docente/${id}`, dados);
  },

  deleteById: async (id: number): Promise<void | Error> => {
    try {
      await Api.delete(`/docente/${id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao deletar o registro.');
    }
  },
};
