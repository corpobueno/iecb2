import { Request, Response } from 'express';
import { ChecklistAdmissaoUseCases } from '../../usecases/rh/ChecklistAdmissaoUseCases';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../../utils/handleError';

export class ChecklistAdmissaoController {
  constructor(private useCases: ChecklistAdmissaoUseCases) {}

  async findByColaborador(req: Request, res: Response) {
    try {
      const idColaborador = Number(req.params.idColaborador);
      const result = await this.useCases.findByColaborador(idColaborador);
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
      const data = {
        ...req.body,
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
      await this.useCases.delete(id);
      return res.status(StatusCodes.OK).json({ message: 'Excluído com sucesso' });
    } catch (error) {
      handleError(error, res);
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const idColaborador = Number(req.params.idColaborador);
      const stats = await this.useCases.getStats(idColaborador);
      return res.status(StatusCodes.OK).json(stats);
    } catch (error) {
      handleError(error, res);
    }
  }

  async marcarConcluido(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const empresa = Number(req.user?.companyId);
      const usuario = req.user?.username || '';

      await this.useCases.marcarConcluido(id, usuario, empresa);
      return res.status(StatusCodes.OK).json({ message: 'Item marcado como concluído' });
    } catch (error) {
      handleError(error, res);
    }
  }

  async desmarcarConcluido(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const empresa = Number(req.user?.companyId);
      const usuario = req.user?.username || '';

      await this.useCases.desmarcarConcluido(id, usuario, empresa);
      return res.status(StatusCodes.OK).json({ message: 'Item desmarcado' });
    } catch (error) {
      handleError(error, res);
    }
  }
}
