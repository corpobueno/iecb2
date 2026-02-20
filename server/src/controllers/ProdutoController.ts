import { Request, Response } from 'express';
import { ProdutoUseCases } from '../usecases/ProdutoUseCases';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../utils/handleError';

export class ProdutoController {
  constructor(private useCases: ProdutoUseCases) {}

  async findAll(req: Request, res: Response) {
    try {
      const empresa = req.user?.companyId || 1;
      const result = await this.useCases.findAll(empresa);
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

  async findLancamentos(req: Request, res: Response) {
    try {
      const filtros = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        filter: req.query.filter ? String(req.query.filter) : undefined,
        usuario: req.query.usuario ? String(req.query.usuario) : undefined,
      };
      const result = await this.useCases.findLancamentos(filtros);
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async processarVenda(req: Request, res: Response) {
    try {
      const caixa = req.user?.username || '';
      // Usa usuario do body se fornecido, senão usa o caixa (usuário logado)
      const usuario = req.body.usuario || caixa;
      const dados = { ...req.body, usuario, caixa };
      const result = await this.useCases.processarVenda(dados);
      return res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }
}
