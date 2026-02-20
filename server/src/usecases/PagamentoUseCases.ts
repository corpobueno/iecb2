import { IPagamento, IPagamentoForm, IPagamentoProcessar, ICaixaPagamentoFiltros, ICaixaPagamentoResult, ICaixaFiltrosOptions, ICaixaDetalhesFiltros, IPagamentoDetalhe, IVendaProduto } from '../entities/IPagamento';
import PagamentoRepository from '../repositories/PagamentoRepository';
import { AppError } from '../utils/AppError';
import { sanitizeEmptyToNull } from '../utils/sanitizeData';
import db from '../db';

export class PagamentoUseCases {
  constructor(private repository: PagamentoRepository) {}

  async findByCliente(idCliente: number, ativo: number = 1): Promise<IPagamento[]> {
    return this.repository.findByCliente(idCliente, ativo);
  }

  async findByAula(idAula: number, ativo: number = 1): Promise<IPagamento[]> {
    return this.repository.findByAula(idAula, ativo);
  }

  async getById(id: number): Promise<IPagamento> {
    const result = await this.repository.getById(id);
    if (!result) {
      throw new AppError('Pagamento não encontrado', 404);
    }
    return result;
  }

  async create(data: IPagamentoForm): Promise<number> {
    if (!data.idCliente) {
      throw new AppError('Cliente é obrigatório', 400);
    }
    if (!data.valor) {
      throw new AppError('Valor é obrigatório', 400);
    }
    const sanitizedData = sanitizeEmptyToNull(data);
    return this.repository.create(sanitizedData);
  }

  async update(id: number, data: Partial<IPagamentoForm>): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Pagamento não encontrado', 404);
    }
    const sanitizedData = sanitizeEmptyToNull(data);
    return this.repository.update(id, sanitizedData);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new AppError('Pagamento não encontrado', 404);
    }

    // Se for "Crédito Cliente" (idPagamento = 16), converter de volta em crédito
    if (existing.idPagamento === 16) {
      return this.repository.convertToCredit(id);
    }

    return this.repository.delete(id);
  }

  async getCreditosByCliente(idCliente: number): Promise<{ creditos: number }> {
    return this.repository.getCreditosByCliente(idCliente);
  }

  /**
   * Processa pagamento de um aluno matriculado
   * Cria registros de pagamento e atualiza créditos se necessário
   */
  async processarPagamentoAluno(dados: IPagamentoProcessar): Promise<number[]> {
    const { idCliente, idAula, idAluno, docente, caixa, pagamentos } = dados;

    const trx = await db.transaction();
    const ids: number[] = [];

    try {
      for (const pag of pagamentos) {
        // Se for pagamento com crédito do cliente (idPagamento = 16)
        if (pag.idPagamento === 16) {
          // Buscar créditos disponíveis do cliente
          const creditosDisp = await trx('pagamento_iecb')
            .where({ id_cliente: idCliente, ativo: 1 })
            .whereNull('id_aula')
            .where('valor', '>', 0)
            .orderBy('data', 'asc');

          let valorConsumido = 0;
          let valorRestante = pag.valor;

          // Consumir créditos existentes
          for (const credito of creditosDisp) {
            if (valorRestante <= 0) break;

            const valorCredito = Number(credito.valor);

            if (valorCredito <= valorRestante) {
              // Consumir todo o crédito (zerar)
              await trx('pagamento_iecb')
                .where({ id: credito.id })
                .update({ valor: 0 });
              valorConsumido += valorCredito;
              valorRestante -= valorCredito;
            } else {
              // Consumir parcialmente o crédito
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

          // Registrar o uso do crédito como pagamento
          const [id] = await trx('pagamento_iecb').insert({
            idCliente,
            idAula,
            idAluno,
            docente,
            caixa,
            valor: pag.valor,
            qnt: pag.qnt,
            idPagamento: pag.idPagamento,
          });
          ids.push(id);
        } else {
          // Pagamento normal
          const [id] = await trx('pagamento_iecb').insert({
            idCliente,
            idAula,
            idAluno,
            docente,
            caixa,
            valor: pag.valor,
            qnt: pag.qnt,
            idPagamento: pag.idPagamento,
          });
          ids.push(id);
        }
      }

      await trx.commit();
      return ids;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Processa venda de um produto
   * Cria registros de pagamento vinculados ao produto
   */
  async processarVendaProduto(dados: IVendaProduto): Promise<number[]> {
    const { idCliente, idProduto, caixa, pagamentos } = dados;

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
    const ids: number[] = [];

    try {
      for (const pag of pagamentos) {
        // Se for pagamento com crédito do cliente (idPagamento = 16)
        if (pag.idPagamento === 16) {
          // Buscar créditos disponíveis do cliente
          const creditosDisp = await trx('pagamento_iecb')
            .where({ id_cliente: idCliente, ativo: 1 })
            .whereNull('id_aula')
            .whereNull('id_produto')
            .where('valor', '>', 0)
            .orderBy('data', 'asc');

          let valorConsumido = 0;
          let valorRestante = pag.valor;

          // Consumir créditos existentes
          for (const credito of creditosDisp) {
            if (valorRestante <= 0) break;

            const valorCredito = Number(credito.valor);

            if (valorCredito <= valorRestante) {
              // Consumir todo o crédito (zerar)
              await trx('pagamento_iecb')
                .where({ id: credito.id })
                .update({ valor: 0 });
              valorConsumido += valorCredito;
              valorRestante -= valorCredito;
            } else {
              // Consumir parcialmente o crédito
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

          // Registrar o uso do crédito como pagamento
          const [id] = await trx('pagamento_iecb').insert({
            id_cliente: idCliente,
            id_produto: idProduto,
            caixa,
            valor: pag.valor,
            qnt: pag.qnt,
            id_pagamento: pag.idPagamento,
          });
          ids.push(id);
        } else {
          // Pagamento normal
          const [id] = await trx('pagamento_iecb').insert({
            id_cliente: idCliente,
            id_produto: idProduto,
            caixa,
            valor: pag.valor,
            qnt: pag.qnt,
            id_pagamento: pag.idPagamento,
          });
          ids.push(id);
        }
      }

      await trx.commit();
      return ids;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async getCaixaPagamentos(filtros: ICaixaPagamentoFiltros): Promise<ICaixaPagamentoResult> {
    if (!filtros.data_inicio || !filtros.data_fim) {
      throw new AppError('Data inicial e final são obrigatórias', 400);
    }
    return this.repository.getCaixaPagamentos(filtros);
  }

  async getCaixaFiltrosOptions(filtros: ICaixaPagamentoFiltros): Promise<ICaixaFiltrosOptions> {
    if (!filtros.data_inicio || !filtros.data_fim) {
      throw new AppError('Data inicial e final são obrigatórias', 400);
    }
    return this.repository.getCaixaFiltrosOptions(filtros);
  }

  async getCaixaDetalhes(filtros: ICaixaDetalhesFiltros): Promise<IPagamentoDetalhe[]> {
    if (!filtros.data_inicio || !filtros.data_fim) {
      throw new AppError('Data inicial e final são obrigatórias', 400);
    }
    if (filtros.idPagamento === undefined) {
      throw new AppError('Forma de pagamento é obrigatória', 400);
    }
    return this.repository.getCaixaDetalhes(filtros);
  }

  /**
   * Estorna um pagamento criando um registro com valor negativo
   * @param id ID do pagamento original
   * @param caixa Login do usuário que está realizando o estorno
   */
  async estornar(id: number, caixa: string): Promise<number> {
    const original = await this.repository.getById(id);
    if (!original) {
      throw new AppError('Pagamento não encontrado', 404);
    }

    // Criar registro de estorno com valor negativo
    const estornoData = sanitizeEmptyToNull({
      idCliente: original.idCliente,
      idAula: original.idAula,
      idAluno: original.idAluno,
      idLancamentos: original.idLancamentos,
      docente: original.docente,
      caixa: caixa,
      valor: -Math.abs(Number(original.valor)),
      qnt: original.qnt,
      idPagamento: original.idPagamento,
    });

    return this.repository.create(estornoData);
  }
}
