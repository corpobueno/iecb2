import { IProdutoSaldo, ILancamentoFiltros, ILancamentoPage, IVendaProdutoForm } from '../entities/IProduto';
import ProdutoRepository from '../repositories/ProdutoRepository';
import { AppError } from '../utils/AppError';
import { sanitizeEmptyToNull } from '../utils/sanitizeData';
import db from '../db';

export class ProdutoUseCases {
  constructor(private repository: ProdutoRepository) {}

  async findAll(empresa: number): Promise<IProdutoSaldo[]> {
    return this.repository.findAll(empresa);
  }

  async getById(id: number): Promise<IProdutoSaldo> {
    const result = await this.repository.getById(id);
    if (!result) {
      throw new AppError('Produto não encontrado', 404);
    }
    return result;
  }

  async findLancamentos(filtros: ILancamentoFiltros): Promise<ILancamentoPage> {
    return this.repository.findLancamentos(filtros);
  }

  /**
   * Processa venda de um produto
   * 1. Insere em lancamentos_iecb (id_cliente, produto, usuario, data)
   * 2. Insere em pagamento_iecb com id_lancamentos apontando para o lançamento
   */
  async processarVenda(dados: IVendaProdutoForm): Promise<{ idLancamento: number; idsPagamento: number[] }> {
    const { idCliente, idProduto, usuario, caixa, pagamentos } = dados;

    if (!idCliente) {
      throw new AppError('Cliente é obrigatório', 400);
    }
    if (!idProduto) {
      throw new AppError('Produto é obrigatório', 400);
    }
    if (!pagamentos || pagamentos.length === 0) {
      throw new AppError('Pelo menos um pagamento é obrigatório', 400);
    }

    const trx = await db.transaction();
    const idsPagamento: number[] = [];

    try {
      // 1. Inserir em lancamentos_iecb
      const lancamentoData = sanitizeEmptyToNull({
        id_cliente: idCliente,
        produto: idProduto,
        usuario: usuario,
        data: new Date(),
      });
      const [idLancamento] = await trx('lancamentos_iecb').insert(lancamentoData);

      // 2. Inserir pagamentos vinculados ao lançamento
      for (const pag of pagamentos) {
        // Se for pagamento com crédito do cliente (idPagamento = 16)
        if (pag.idPagamento === 16) {
          // Buscar créditos disponíveis do cliente
          const creditosDisp = await trx('pagamento_iecb')
            .where({ id_cliente: idCliente, ativo: 1 })
            .whereNull('id_aula')
            .whereNull('id_lancamentos')
            .where('valor', '>', 0)
            .orderBy('data', 'asc');

          let valorConsumido = 0;
          let valorRestante = pag.valor;

          // Consumir créditos existentes
          for (const credito of creditosDisp) {
            if (valorRestante <= 0) break;

            const valorCredito = Number(credito.valor);

            if (valorCredito <= valorRestante) {
              await trx('pagamento_iecb')
                .where({ id: credito.id })
                .update({ valor: 0 });
              valorConsumido += valorCredito;
              valorRestante -= valorCredito;
            } else {
              await trx('pagamento_iecb')
                .where({ id: credito.id })
                .update({ valor: valorCredito - valorRestante });
              valorConsumido += valorRestante;
              valorRestante = 0;
            }
          }

          if (valorConsumido < pag.valor) {
            throw new AppError(`Crédito insuficiente. Disponível: R$ ${valorConsumido.toFixed(2)}`, 400);
          }
        }

        // Inserir pagamento vinculado ao lançamento
        const [idPag] = await trx('pagamento_iecb').insert({
          id_cliente: idCliente,
          id_lancamentos: idLancamento,
          caixa,
          valor: pag.valor,
          qnt: pag.qnt,
          id_pagamento: pag.idPagamento,
        });
        idsPagamento.push(idPag);
      }

      await trx.commit();
      return { idLancamento, idsPagamento };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
