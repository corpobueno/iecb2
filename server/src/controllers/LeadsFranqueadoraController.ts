import { Request, Response } from 'express';
import { LeadsFranqueadoraUseCases } from '../usecases/LeadsFranqueadoraUseCases';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../utils/handleError';

export class LeadsFranqueadoraController {
  constructor(private useCases: LeadsFranqueadoraUseCases) {}

  async find(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 30;
      const filter = String(req.query.filter || '');

      const result = await this.useCases.find(page, limit, filter);

      res.setHeader('access-control-expose-headers', 'x-total-count');
      res.setHeader('x-total-count', result.totalCount);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async findPrincipal(req: Request, res: Response) {
    try {
      const filtros = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        filter: String(req.query.filter || ''),
        dataInicio: req.query.data_inicio ? String(req.query.data_inicio) : undefined,
        dataFim: req.query.data_fim ? String(req.query.data_fim) : undefined,
        status: req.query.status ? String(req.query.status) : undefined,
        user: req.query.user ? String(req.query.user) : undefined,
      };

      const result = await this.useCases.findPrincipal(filtros);

      res.setHeader('access-control-expose-headers', 'x-total-count');
      res.setHeader('x-total-count', result.totalCount);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async getPrincipalById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const result = await this.useCases.getById(id);

      if (!result) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Lead não encontrado' });
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async getComentarios(req: Request, res: Response) {
    try {
      const telefone = String(req.params.telefone);
      const result = await this.useCases.getComentariosByTelefone(telefone);
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
      const data = { ...req.body, user: req.user?.username };
      const id = await this.useCases.create(data);
      return res.status(StatusCodes.CREATED).json({ id });
    } catch (error) {
      handleError(error, res);
    }
  }

  async createComentario(req: Request, res: Response) {
    try {
      const data = { ...req.body, user: req.user?.username };
      const id = await this.useCases.createComentario(data);
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
}
