import { Request, Response } from 'express';
import { CategoriaCursoUseCases } from '../usecases/CategoriaCursoUseCases';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../utils/handleError';

export class CategoriaCursoController {
  constructor(private useCases: CategoriaCursoUseCases) {}

  async find(_req: Request, res: Response) {
    try {
      const result = await this.useCases.find();
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
}
