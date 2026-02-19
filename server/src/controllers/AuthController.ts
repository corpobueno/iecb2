// src/controllers/AuthController.ts
import { Request, Response } from 'express';
import { AuthUseCases } from '../usecases/AuthUseCases';
import { StatusCodes } from 'http-status-codes';
import { handleError } from '../utils/handleError';

export class AuthController {
  constructor(private authCases: AuthUseCases) { }

  /**
   * Autentica via frame token do Corpo Bueno
   * Método principal de autenticação
   */
  async authFrameToken(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          errors: { default: 'Token não informado' }
        });
      }

      const result = await this.authCases.authFrameToken(token);

      if (result instanceof Error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          errors: { default: result.message }
        });
      }

      // Define o cookie httpOnly com o token JWT local
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        maxAge: this.getMsUntilMidnight(),
        sameSite: isProduction ? 'none' : 'lax', // 'none' para cross-site em produção
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * Autentica via iframe de domínio autorizado
   * Verifica o referrer e cria sessão automaticamente
   */
  async authIframe(req: Request, res: Response) {
    try {
      const { referrer, login } = req.body;

      // Lista de domínios autorizados
      const allowedDomains = [
        'app.corpobueno.com.br',
        'app.institutocorpobueno.com.br',
        'web.sysnode.com.br',
        'localhost:5173', // Para desenvolvimento
        'localhost:5174', // Para desenvolvimento
      ];

      // Verifica se o referrer é de um domínio autorizado
      const isFromAllowedDomain = allowedDomains.some(domain =>
        referrer && referrer.includes(domain)
      );

      if (!isFromAllowedDomain) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          errors: { default: 'Acesso não autorizado' }
        });
      }

      const result = await this.authCases.authIframe(referrer, login);

      if (result instanceof Error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          errors: { default: result.message }
        });
      }

      // Define o cookie httpOnly com o token JWT local
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        maxAge: this.getMsUntilMidnight(),
        sameSite: isProduction ? 'none' : 'lax', // 'none' para cross-site em produção
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * Autentica via senha de administrador
   * Método reserva para quando não houver token (será removido no futuro)
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

      if (result instanceof Error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          errors: { default: result.message }
        });
      }

      // Define o cookie httpOnly com o token JWT local
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        maxAge: this.getMsUntilMidnight(),
        sameSite: isProduction ? 'none' : 'lax', // 'none' para cross-site em produção
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      handleError(error, res);
    }
  }

  async logout(_: Request, res: Response) {
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
      });

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

      const { accessToken } = req.cookies;

      return res.status(StatusCodes.OK).json({
        username: req.user.username,
        accessToken,
        groupId: req.user.groupId,
      });
    } catch (error) {
      handleError(error, res);
    }
  }

  /**
   * Calcula milissegundos até a meia-noite
   */
  private getMsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  }
}
