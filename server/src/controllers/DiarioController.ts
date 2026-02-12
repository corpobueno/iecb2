import { Request, Response } from 'express';
import { DiarioUseCases } from '../usecases/DiarioUseCases';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../utils/handleError';
import { IDiarioFilters } from '../entities/IDiario';

export class DiarioController {
  constructor(private useCases: DiarioUseCases) {}

  async getDiario(req: Request, res: Response) {
    try {
      const filters: IDiarioFilters = {
        dataInicio: String(req.query.data_inicio),
        dataFim: String(req.query.data_fim),
        docente: req.query.docente ? String(req.query.docente) : undefined,
        usuario: req.query.usuario ? String(req.query.usuario) : undefined,
        status: req.query.status !== undefined ? Number(req.query.status) : undefined,
        tipo: req.query.tipo !== undefined ? Number(req.query.tipo) : undefined,
      };

      const result = await this.useCases.getDiario(filters);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }
}
