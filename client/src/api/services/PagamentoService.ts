import { Api } from '../axios-config';
import { IPagamento, IPagamentoForm, IPagamentoPage, IPagamentoProcessar, ICaixaPagamentoFiltros, ICaixaPagamentoResult, ICaixaFiltrosOptions, ICaixaDetalhesFiltros, IPagamentoDetalhe } from '../../entities/Iecb';

export const PagamentoService = {
  findByCliente: async (idCliente: number, ativo = 1): Promise<IPagamentoPage | Error> => {
    try {
      const { data } = await Api.get(`/pagamento/cliente/${idCliente}?ativo=${ativo}`);

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

  findByAula: async (idAula: number, ativo = 1): Promise<IPagamentoPage | Error> => {
    try {
      const { data } = await Api.get(`/pagamento/aula/${idAula}?ativo=${ativo}`);

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

  getById: async (id: number): Promise<IPagamento> => {
    const { data } = await Api.get(`/pagamento/${id}`);

    if (data) {
      return data;
    }

    throw new Error('Erro ao consultar o registro.');
  },

  create: async (dados: IPagamentoForm): Promise<number> => {
    const { data } = await Api.post<{ id: number }>('/pagamento', dados);

    if (data) {
      return data.id;
    }

    throw new Error('Erro ao criar o registro.');
  },

  update: async (id: number, dados: Partial<IPagamento>): Promise<void> => {
    await Api.put(`/pagamento/${id}`, dados);
  },

  deleteById: async (id: number): Promise<void | Error> => {
    try {
      await Api.delete(`/pagamento/${id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao deletar o registro.');
    }
  },

  getCreditosByCliente: async (idCliente: number): Promise<{ creditos: number } | Error> => {
    try {
      const { data } = await Api.get(`/pagamento/creditos/${idCliente}`);

      if (data) {
        return data;
      }

      return new Error('Erro ao buscar créditos.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao buscar créditos.');
    }
  },

  processarPagamentoAluno: async (dados: IPagamentoProcessar): Promise<{ ids: number[] } | Error> => {
    try {
      const { data } = await Api.post<{ ids: number[] }>('/pagamento/processar', dados);

      if (data) {
        return data;
      }

      return new Error('Erro ao processar pagamento.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao processar pagamento.');
    }
  },

  getCaixaPagamentos: async (filtros: ICaixaPagamentoFiltros): Promise<ICaixaPagamentoResult | Error> => {
    try {
      const params = new URLSearchParams({
        data_inicio: filtros.data_inicio,
        data_fim: filtros.data_fim,
      });
      if (filtros.caixa) params.append('caixa', filtros.caixa);
      if (filtros.docente) params.append('docente', filtros.docente);

      const { data } = await Api.get(`/pagamento/caixa?${params.toString()}`);

      if (data) {
        return data;
      }

      return new Error('Erro ao buscar dados do caixa.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao buscar dados do caixa.');
    }
  },

  getCaixaFiltrosOptions: async (filtros: ICaixaPagamentoFiltros): Promise<ICaixaFiltrosOptions | Error> => {
    try {
      const params = new URLSearchParams({
        data_inicio: filtros.data_inicio,
        data_fim: filtros.data_fim,
      });

      const { data } = await Api.get(`/pagamento/caixa/filtros?${params.toString()}`);

      if (data) {
        return data;
      }

      return new Error('Erro ao buscar opções de filtro.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao buscar opções de filtro.');
    }
  },

  getCaixaDetalhes: async (filtros: ICaixaDetalhesFiltros): Promise<IPagamentoDetalhe[] | Error> => {
    try {
      const params = new URLSearchParams({
        data_inicio: filtros.data_inicio,
        data_fim: filtros.data_fim,
        idPagamento: String(filtros.idPagamento),
      });
      if (filtros.caixa) params.append('caixa', filtros.caixa);
      if (filtros.docente) params.append('docente', filtros.docente);

      const { data } = await Api.get(`/pagamento/caixa/detalhes?${params.toString()}`);

      if (data) {
        return data;
      }

      return new Error('Erro ao buscar detalhes dos pagamentos.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao buscar detalhes dos pagamentos.');
    }
  },

  estornar: async (id: number): Promise<{ id: number; message: string } | Error> => {
    try {
      const { data } = await Api.post(`/pagamento/estornar/${id}`);

      if (data) {
        return data;
      }

      return new Error('Erro ao estornar pagamento.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao estornar pagamento.');
    }
  },
};
