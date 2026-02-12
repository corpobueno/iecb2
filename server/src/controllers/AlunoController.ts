import { Request, Response } from 'express';
import { AlunoUseCases } from '../usecases/AlunoUseCases';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../utils/handleError';

export class AlunoController {
  constructor(private useCases: AlunoUseCases) {}

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

  async findByAulaAndData(req: Request, res: Response) {
    try {
      const idAula = Number(req.params.idAula);
      const data = String(req.params.data);
      const result = await this.useCases.findByAulaAndData(idAula, data);
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

  async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      await this.useCases.updateStatus(id, status);
      return res.status(StatusCodes.OK).json({ message: 'Status atualizado com sucesso' });
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

  async sumValorByAula(req: Request, res: Response) {
    try {
      const idAula = Number(req.params.idAula);
      const sum = await this.useCases.sumValorByAula(idAula);
      return res.status(StatusCodes.OK).json({ sum });
    } catch (error) {
      handleError(error, res);
    }
  }
}
