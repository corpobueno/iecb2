import { Api } from '../axios-config';
import { IAgenda, IAgendaForm, IAgendaPage } from '../../entities/Iecb';

export const AgendaService = {
  findByData: async (data: string, ativo = 1): Promise<IAgendaPage | Error> => {
    try {
      const { data: responseData } = await Api.get(`/agenda/data/${data}?ativo=${ativo}`);

      if (responseData) {
        return {
          data: responseData,
          totalCount: responseData.length,
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

  findByPeriodo: async (dataInicio: string, dataFim: string, ativo = 1): Promise<IAgendaPage | Error> => {
    try {
      const { data: responseData } = await Api.get(
        `/agenda/periodo?data_inicio=${dataInicio}&data_fim=${dataFim}&ativo=${ativo}`
      );

      if (responseData) {
        return {
          data: responseData,
          totalCount: responseData.length,
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

  getById: async (id: number): Promise<IAgenda> => {
    const { data } = await Api.get(`/agenda/${id}`);

    if (data) {
      return data;
    }

    throw new Error('Erro ao consultar o registro.');
  },

  create: async (dados: IAgendaForm): Promise<number> => {
    const { data } = await Api.post<{ id: number }>('/agenda', dados);

    if (data) {
      return data.id;
    }

    throw new Error('Erro ao criar o registro.');
  },

  update: async (id: number, dados: Partial<IAgenda>): Promise<void> => {
    await Api.put(`/agenda/${id}`, dados);
  },

  deleteById: async (id: number): Promise<void | Error> => {
    try {
      await Api.delete(`/agenda/${id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao deletar o registro.');
    }
  },

  countByAula: async (idAula: number): Promise<number> => {
    const { data } = await Api.get(`/agenda/aula/${idAula}/count`);
    return data?.count || 0;
  },
};
