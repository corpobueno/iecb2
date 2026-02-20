import { Api } from '../axios-config';
import { Environment } from '../axios-config/environment';
import { IProduto, IProdutoPage, IVendaProdutoForm, ILancamentoPage } from '../../entities/Iecb';

export const ProdutoService = {
  /**
   * Lista todos os produtos ativos
   */
  findAll: async (): Promise<IProdutoPage | Error> => {
    try {
      const { data } = await Api.get('/produto');

      if (data) {
        return {
          data,
          totalCount: data.length,
        };
      }

      return new Error('Erro ao listar os produtos.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao listar os produtos.');
    }
  },

  /**
   * Busca um produto por ID
   */
  getById: async (id: number): Promise<IProduto | Error> => {
    try {
      const { data } = await Api.get(`/produto/${id}`);

      if (data) {
        return data;
      }

      return new Error('Erro ao buscar o produto.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao buscar o produto.');
    }
  },

  /**
   * Processa a venda de um produto
   * Insere em lancamentos_iecb e pagamento_iecb
   */
  processarVenda: async (dados: IVendaProdutoForm): Promise<{ idLancamento: number; idsPagamento: number[] } | Error> => {
    try {
      const { data } = await Api.post<{ idLancamento: number; idsPagamento: number[] }>('/produto/venda', dados);

      if (data) {
        return data;
      }

      return new Error('Erro ao processar venda.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao processar venda.');
    }
  },

  /**
   * Lista lançamentos (vendas de produtos) com filtros e paginação
   */
  findLancamentos: async (
    page = 1,
    filter = '',
    usuario = ''
  ): Promise<ILancamentoPage | Error> => {
    try {
      const urlRelativa = `/produto/lancamentos?page=${page}&limit=${Environment.LIMITE_DE_LINHAS}&filter=${filter}&usuario=${usuario}`;
      const { data } = await Api.get<ILancamentoPage>(urlRelativa);

      if (data) {
        return data;
      }

      return new Error('Erro ao listar os lançamentos.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao listar os lançamentos.');
    }
  },
};
