import { Request, Response } from 'express';
import { AulaUseCases } from '../usecases/AulaUseCases';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../utils/handleError';

export class AulaController {
  constructor(private useCases: AulaUseCases) { }

  async find(req: Request, res: Response) {
    try {
      const ativo = Number(req.query.ativo ?? 1);
      const result = await this.useCases.find(ativo);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async findDisponiveis(req: Request, res: Response) {
    try {
      const ativo = Number(req.query.ativo ?? 1);
      const result = await this.useCases.findDisponiveis(ativo);
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

  async cancel(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await this.useCases.cancel(id);
      return res.status(StatusCodes.OK).json({ message: 'Cancelado com sucesso' });
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
