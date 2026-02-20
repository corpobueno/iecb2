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

  async validate(req: Request, res: Response) {

    function verificarCamposExistem(body: any, user: any): boolean {
      // Verifica se os objetos existem
      if (!body || !user) return false;

      // Verifica se todos os campos do body existem
      const bodyCamposExistem = 'usuario' in body && 'empresa' in body && 'grupo' in body;

      // Verifica se todos os campos do user existem
      const userCamposExistem = 'username' in user && 'companyId' in user && 'groupId' in user;

      // Verifica se os valores não são undefined
      const bodyValoresExistem = body.usuario !== undefined &&
        body.empresa !== undefined &&
        body.grupo !== undefined;

      const userValoresExistem = user.username !== undefined &&
        user.companyId !== undefined &&
        user.groupId !== undefined;

      return bodyCamposExistem && userCamposExistem && bodyValoresExistem && userValoresExistem;
    }
    try {
      const { user, body } = req;

      if (!verificarCamposExistem(body, user)) {
        console.error('[AuthController] Campos necessários ausentes ou undefined. Body:', body, 'User:', user);
        throw new Error('Dados de autenticação incompletos ou inválidos');
      }

      const result = await this.authCases.validate(user, body);

      if (result.accessToken) {
        console.log('[AuthController] Sessão validada e token atualizado para usuário:', result.username);
        
        res.clearCookie('accessToken');
        res.cookie('accessToken', result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000, // 24 horas
        });
      }

      return res.status(StatusCodes.OK).json({
        username: result.username,
        groupId: result.groupId,
        companyId: result.companyId,
      });
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


}

