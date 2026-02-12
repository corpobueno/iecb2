import { Request, Response } from 'express';
import { AgendaUseCases } from '../usecases/AgendaUseCases';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../utils/handleError';

export class AgendaController {
  constructor(private useCases: AgendaUseCases) {}

  async findByData(req: Request, res: Response) {
    try {
      const { data } = req.params;
      const ativo = Number(req.query.ativo ?? 1);
      const result = await this.useCases.findByData(data, ativo);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async findByPeriodo(req: Request, res: Response) {
    try {
      const dataInicio = String(req.query.data_inicio);
      const dataFim = String(req.query.data_fim);
      const ativo = Number(req.query.ativo ?? 1);
      const result = await this.useCases.findByPeriodo(dataInicio, dataFim, ativo);
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
      const data = { ...req.body, usuario: req.user?.username };
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

  async countByAula(req: Request, res: Response) {
    try {
      const idAula = Number(req.params.idAula);
      const count = await this.useCases.countByAula(idAula);
      return res.status(StatusCodes.OK).json({ count });
    } catch (error) {
      handleError(error, res);
    }
  }
}
