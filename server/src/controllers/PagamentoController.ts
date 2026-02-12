import { Request, Response } from 'express';
import { PagamentoUseCases } from '../usecases/PagamentoUseCases';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../utils/handleError';

export class PagamentoController {
  constructor(private useCases: PagamentoUseCases) {}

  async findByCliente(req: Request, res: Response) {
    try {
      const idCliente = Number(req.params.idCliente);
      const ativo = Number(req.query.ativo ?? 1);
      const result = await this.useCases.findByCliente(idCliente, ativo);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async findByAula(req: Request, res: Response) {
    try {
      const idAula = Number(req.params.idAula);
      const ativo = Number(req.query.ativo ?? 1);
      const result = await this.useCases.findByAula(idAula, ativo);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const result = await this.useCases.getById(id);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = { ...req.body, caixa: req.user?.username };
      const id = await this.useCases.create(data);
      return res.status(StatusCodes.CREATED).json({ id });
    } catch (error) {
      handleError(error, res);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await this.useCases.update(id, req.body);
      return res.status(StatusCodes.OK).json({ message: 'Atualizado com sucesso' });
    } catch (error) {
      handleError(error, res);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await this.useCases.delete(id);
      return res.status(StatusCodes.OK).json({ message: 'Excluído com sucesso' });
    } catch (error) {
      handleError(error, res);
    }
  }

  async getCreditosByCliente(req: Request, res: Response) {
    try {
      const idCliente = Number(req.params.idCliente);
      const result = await this.useCases.getCreditosByCliente(idCliente);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async processarPagamentoAluno(req: Request, res: Response) {
    try {
      const caixa = req.user?.username || '';
      const dados = { ...req.body, caixa };
      const ids = await this.useCases.processarPagamentoAluno(dados);
      return res.status(StatusCodes.CREATED).json({ ids });
    } catch (error) {
      handleError(error, res);
    }
  }

  async getCaixaPagamentos(req: Request, res: Response) {
    try {
      const filtros = {
        data_inicio: String(req.query.data_inicio),
        data_fim: String(req.query.data_fim),
        caixa: req.query.caixa ? String(req.query.caixa) : undefined,
        docente: req.query.docente ? String(req.query.docente) : undefined,
      };
      const result = await this.useCases.getCaixaPagamentos(filtros);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async getCaixaFiltrosOptions(req: Request, res: Response) {
    try {
      const filtros = {
        data_inicio: String(req.query.data_inicio),
        data_fim: String(req.query.data_fim),
      };
      const result = await this.useCases.getCaixaFiltrosOptions(filtros);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async getCaixaDetalhes(req: Request, res: Response) {
    try {
      const filtros = {
        data_inicio: String(req.query.data_inicio),
        data_fim: String(req.query.data_fim),
        caixa: req.query.caixa ? String(req.query.caixa) : undefined,
        docente: req.query.docente ? String(req.query.docente) : undefined,
        idPagamento: Number(req.query.idPagamento),
      };
      const result = await this.useCases.getCaixaDetalhes(filtros);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }
}
