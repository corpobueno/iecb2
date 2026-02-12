import { Api } from '../axios-config';
import { IAluno, IAlunoForm, IAlunoPage } from '../../entities/Iecb';

export const AlunoService = {
  findByAula: async (idAula: number, ativo = 1): Promise<IAlunoPage | Error> => {
    try {
      const { data } = await Api.get(`/aluno/aula/${idAula}?ativo=${ativo}`);

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

  findByAulaAndData: async (idAula: number, dataStr: string): Promise<IAlunoPage | Error> => {
    try {
      const { data } = await Api.get(`/aluno/aula/${idAula}/data/${dataStr}`);

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

  getById: async (id: number): Promise<IAluno> => {
    const { data } = await Api.get(`/aluno/${id}`);

    if (data) {
      return data;
    }

    throw new Error('Erro ao consultar o registro.');
  },

  create: async (dados: IAlunoForm): Promise<number> => {
    const { data } = await Api.post<{ id: number }>('/aluno', dados);

    if (data) {
      return data.id;
    }

    throw new Error('Erro ao criar o registro.');
  },

  update: async (id: number, dados: Partial<IAluno>): Promise<void> => {
    await Api.put(`/aluno/${id}`, dados);
  },

  updateStatus: async (id: number, status: number): Promise<void> => {
    await Api.patch(`/aluno/${id}/status`, { status });
  },

  deleteById: async (id: number): Promise<void | Error> => {
    try {
      await Api.delete(`/aluno/${id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao deletar o registro.');
    }
  },

  sumValorByAula: async (idAula: number): Promise<number | Error> => {
    try {
      const { data } = await Api.get(`/aluno/aula/${idAula}/sum`);

      if (data) {
        return data.sum;
      }

      return new Error('Erro ao calcular soma.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao calcular soma.');
    }
  },
};
