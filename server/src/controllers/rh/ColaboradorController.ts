import { Request, Response } from 'express';
import { ColaboradorUseCases } from '../../usecases/rh/ColaboradorUseCases';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../../utils/handleError';
import { IColaboradorFilters } from '../../entities/rh';

export class ColaboradorController {
  constructor(private useCases: ColaboradorUseCases) {}

  async find(req: Request, res: Response) {
    try {
      const empresa = Number(req.user?.companyId);
      const filters: IColaboradorFilters = {
        empresa,
        status: req.query.status as any,
        setor: req.query.setor as string,
        search: req.query.search as string,
        ativo: Number(req.query.ativo ?? 1)
      };

      const result = await this.useCases.find(filters);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const empresa = Number(req.user?.companyId);

      const result = await this.useCases.getById(id, empresa);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const empresa = Number(req.user?.companyId);
      const data = {
        ...req.body,
        empresa,
        usuario: req.user?.username
      };

      const id = await this.useCases.create(data);
      return res.status(StatusCodes.CREATED).json({ id });
    } catch (error) {
      handleError(error, res);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const empresa = Number(req.user?.companyId);
      const data = {
        ...req.body,
        usuario: req.user?.username
      };

      await this.useCases.update(id, data, empresa);
      return res.status(StatusCodes.OK).json({ message: 'Atualizado com sucesso' });
    } catch (error) {
      handleError(error, res);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const empresa = Number(req.user?.companyId);

      await this.useCases.delete(id, empresa);
      return res.status(StatusCodes.OK).json({ message: 'Excluído com sucesso' });
    } catch (error) {
      handleError(error, res);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const empresa = Number(req.user?.companyId);
      const { status } = req.body;

      await this.useCases.updateStatus(id, status, empresa);
      return res.status(StatusCodes.OK).json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
      handleError(error, res);
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const empresa = Number(req.user?.companyId);
      const stats = await this.useCases.getStats(empresa);
      return res.status(StatusCodes.OK).json(stats);
    } catch (error) {
      handleError(error, res);
    }
  }

  async recalcularScore(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const empresa = Number(req.user?.companyId);

      const score = await this.useCases.recalcularScoreIntegracao(id, empresa);
      return res.status(StatusCodes.OK).json({ score });
    } catch (error) {
      handleError(error, res);
    }
  }
}
