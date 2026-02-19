// src/controllers/AuthController.ts
import { Request, Response } from 'express';
import { AuthUseCases } from '../usecases/AuthUseCases';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../utils/handleError';

export class AuthController {
  constructor(private authCases: AuthUseCases) { }

  /**
   * Autentica via postMessage do Sistema A
   * Recebe frameToken, usuario, empresa, grupo via body
   */
  async authPostMessage(req: Request, res: Response) {
    try {
      const { frameToken, usuario, empresa, grupo } = req.body;

      console.log('[AUTH] authPostMessage:', { usuario, empresa, grupo, hasToken: !!frameToken });

      if (!frameToken) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          errors: { default: 'frameToken não informado' }
        });
      }

      const result = await this.authCases.authViaPostMessage(frameToken, usuario, empresa, grupo);

      console.log('[AUTH] Sessão criada:', { username: result.username, groupId: result.groupId });

      // Define o cookie com o novo token
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * Autentica via senha de administrador
   */
  async authAdminPassword(req: Request, res: Response) {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          errors: { default: 'Senha não informada' }
        });
      }

      const result = await this.authCases.authAdminPassword(password);

      // Define o cookie com o novo token
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async logout(_: Request, res: Response) {
    try {
      // Limpa o cookie
      res.clearCookie('accessToken');

      return res.status(StatusCodes.OK).json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      handleError(error, res);
    }
  }

  async validate(req: Request, res: Response) {
    try {
      if (!req.user?.username) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          errors: { default: 'Usuário não autenticado' }
        });
      }

      return res.status(StatusCodes.OK).json({
        username: req.user.username,
        groupId: req.user.groupId,
        companyId: req.user.companyId,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
}
