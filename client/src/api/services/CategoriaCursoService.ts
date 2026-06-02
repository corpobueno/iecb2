import { Api } from '../axios-config';
import { ICategoriaCurso } from '../../entities/Iecb';

export const CategoriaCursoService = {
  find: async (): Promise<ICategoriaCurso[] | Error> => {
    try {
      const { data } = await Api.get('/categoria-curso');
      if (data) return data;
      return new Error('Erro ao listar categorias.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) return error;
      return new Error('Erro ao listar categorias.');
    }
  },

  getById: async (id: number): Promise<ICategoriaCurso> => {
    const { data } = await Api.get(`/categoria-curso/${id}`);
    if (data) return data;
    throw new Error('Erro ao consultar categoria.');
  },
};
