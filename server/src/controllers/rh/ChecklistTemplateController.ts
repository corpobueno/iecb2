import { Request, Response } from 'express';
import { ChecklistTemplateUseCases } from '../../usecases/rh/ChecklistTemplateUseCases';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../../utils/handleError';
import { IChecklistTemplateFilters } from '../../entities/rh';

export class ChecklistTemplateController {
  constructor(private useCases: ChecklistTemplateUseCases) {}

  async find(req: Request, res: Response) {
    try {
      const empresa = Number(req.user?.companyId);
      const filters: IChecklistTemplateFilters = {
        empresa,
        setor: req.query.setor as string,
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

  async findBySetor(req: Request, res: Response) {
    try {
      const empresa = Number(req.user?.companyId);
      const setor = req.params.setor === 'geral' ? null : req.params.setor;

      const result = await this.useCases.findBySetor(empresa, setor);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async getSetores(req: Request, res: Response) {
    try {
      const empresa = Number(req.user?.companyId);
      const setores = await this.useCases.getSetores(empresa);
      return res.status(StatusCodes.OK).json(setores);
    } catch (error) {
      handleError(error, res);
    }
  }
}
