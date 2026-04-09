// src/controllers/AuthController.ts
import { Request, Response } from 'express';
import { AuthUseCases } from '../usecases/AuthUseCases';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../utils/handleError';

export class AuthController {
  constructor(private authCases: AuthUseCases) { }

  /**
   * Troca um authorization code (frame token do Corpo Bueno) por uma sessão local.
   * O code é validado server-to-server com o backend do Corpo Bueno.
   */
  async exchangeCode(req: Request, res: Response) {
    try {
      const code = req.query.code as string;
      console.log('[AUTH] Exchange iniciado, code recebido:', !!code);

      if (!code) {
        console.warn('[AUTH] Exchange sem code');
        return res.status(StatusCodes.BAD_REQUEST).json({
          errors: { default: 'Código de autenticação não informado' }
        });
      }

      const result = await this.authCases.exchangeCode(code);
      console.log('[AUTH] Exchange bem-sucedido, usuário:', result.username, 'empresa:', result.companyId, 'grupo:', result.groupId);

      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      console.error('[AUTH] Exchange falhou:', error instanceof Error ? error.message : error);
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
        secure: true,
        sameSite: 'none',
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

