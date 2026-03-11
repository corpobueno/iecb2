import { Api } from '../../axios-config';
import {
  IChecklistTemplate,
  IChecklistTemplateForm,
  IChecklistTemplatePage,
  IChecklistAdmissao,
  IChecklistAdmissaoForm,
  IChecklistAdmissaoPage,
  IChecklistStats
} from '../../../entities/Rh';

// =============================================
// CHECKLIST TEMPLATE SERVICE
// =============================================

export const ChecklistTemplateService = {
  find: async (setor?: string): Promise<IChecklistTemplatePage | Error> => {
    try {
      const params = setor ? `?setor=${setor}` : '';
      const { data } = await Api.get(`/rh/checklist-template${params}`);

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

  getById: async (id: number): Promise<IChecklistTemplate | Error> => {
    try {
      const { data } = await Api.get(`/rh/checklist-template/${id}`);

      if (data) {
        return data;
      }

      return new Error('Erro ao consultar o registro.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao consultar o registro.');
    }
  },

  create: async (dados: IChecklistTemplateForm): Promise<number | Error> => {
    try {
      const { data } = await Api.post<{ id: number }>('/rh/checklist-template', dados);

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

  update: async (id: number, dados: Partial<IChecklistTemplateForm>): Promise<void | Error> => {
    try {
      await Api.put(`/rh/checklist-template/${id}`, dados);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao atualizar o registro.');
    }
  },

  deleteById: async (id: number): Promise<void | Error> => {
    try {
      await Api.delete(`/rh/checklist-template/${id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao deletar o registro.');
    }
  },

  getSetores: async (): Promise<string[] | Error> => {
    try {
      const { data } = await Api.get('/rh/checklist-template/setores');

      if (data) {
        return data;
      }

      return new Error('Erro ao buscar setores.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao buscar setores.');
    }
  },

  findBySetor: async (setor: string): Promise<IChecklistTemplatePage | Error> => {
    try {
      const { data } = await Api.get(`/rh/checklist-template/setor/${setor}`);

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
};

// =============================================
// CHECKLIST ADMISSÃO SERVICE
// =============================================

export const ChecklistAdmissaoService = {
  findByColaborador: async (idColaborador: number): Promise<IChecklistAdmissaoPage | Error> => {
    try {
      const { data } = await Api.get(`/rh/checklist-admissao/colaborador/${idColaborador}`);

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

  getById: async (id: number): Promise<IChecklistAdmissao | Error> => {
    try {
      const { data } = await Api.get(`/rh/checklist-admissao/${id}`);

      if (data) {
        return data;
      }

      return new Error('Erro ao consultar o registro.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao consultar o registro.');
    }
  },

  create: async (dados: IChecklistAdmissaoForm): Promise<number | Error> => {
    try {
      const { data } = await Api.post<{ id: number }>('/rh/checklist-admissao', dados);

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

  update: async (id: number, dados: Partial<IChecklistAdmissao>): Promise<void | Error> => {
    try {
      await Api.put(`/rh/checklist-admissao/${id}`, dados);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao atualizar o registro.');
    }
  },

  deleteById: async (id: number): Promise<void | Error> => {
    try {
      await Api.delete(`/rh/checklist-admissao/${id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao deletar o registro.');
    }
  },

  getStats: async (idColaborador: number): Promise<IChecklistStats | Error> => {
    try {
      const { data } = await Api.get(`/rh/checklist-admissao/colaborador/${idColaborador}/stats`);

      if (data) {
        return data;
      }

      return new Error('Erro ao buscar estatísticas.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao buscar estatísticas.');
    }
  },

  marcarConcluido: async (id: number): Promise<void | Error> => {
    try {
      await Api.patch(`/rh/checklist-admissao/${id}/concluir`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao marcar como concluído.');
    }
  },

  desmarcarConcluido: async (id: number): Promise<void | Error> => {
    try {
      await Api.patch(`/rh/checklist-admissao/${id}/desmarcar`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao desmarcar.');
    }
  },
};
