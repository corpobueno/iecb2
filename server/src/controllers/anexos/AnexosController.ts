import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AnexosUseCases } from '../../usecases/anexos/AnexosUseCases';
import { handleError } from '../../utils/handleError';

export class AnexosController {
  constructor(private readonly anexosUseCases: AnexosUseCases) {}

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const empresa = Number(req.user?.companyId);

      const anexo = await this.anexosUseCases.getById(Number(id), empresa || undefined);

      if (!anexo) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: 'Anexo não encontrado'
        });
      }

      return res.status(StatusCodes.OK).json({
        success: true,
        data: anexo
      });
    } catch (error) {
      handleError(error, res);
    }
  };

  getByReferencia = async (req: Request, res: Response) => {
    try {
      const { tabela, id_ref } = req.params;
      const empresa = Number(req.user?.companyId);

      if (!tabela) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: 'Parâmetro tabela é obrigatório'
        });
      }

      if (!id_ref) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: 'Parâmetro id_ref é obrigatório'
        });
      }

      const anexos = await this.anexosUseCases.getByReferencia(tabela, Number(id_ref), empresa || undefined);

      return res.status(StatusCodes.OK).json({
        success: true,
        data: anexos
      });
    } catch (error) {
      handleError(error, res);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const empresa = Number(req.user?.companyId);
      const usuario = req.user?.username || null;

      const anexoData = {
        ...req.body,
        empresa: empresa || req.body.empresa,
        usuario
      };

      const id = await this.anexosUseCases.create(anexoData);

      return res.status(StatusCodes.CREATED).json({
        success: true,
        data: { id },
        message: 'Anexo criado com sucesso'
      });
    } catch (error) {
      handleError(error, res);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const empresa = Number(req.user?.companyId);

      const deleted = await this.anexosUseCases.delete(Number(id), empresa || undefined);

      if (!deleted) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: 'Anexo não encontrado ou não pertence à empresa'
        });
      }

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Anexo excluído com sucesso'
      });
    } catch (error) {
      handleError(error, res);
    }
  };
}
