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

  /**
   * Registra um token efêmero para autenticação via embed (server-to-server)
   * Chamado pelo Backend do Sistema A (Corpo Bueno)
   */
  async registerEmbedToken(req: Request, res: Response) {
    try {
      const { embedToken, login, redirectUrl, frameToken, empresa, unidade, grupo } = req.body;

      console.log('[EMBED-AUTH] registerEmbedToken chamado:', {
        embedToken: embedToken?.substring(0, 8) + '...',
        login,
        redirectUrl,
        empresa,
        unidade,
        grupo,
        hasFrameToken: !!frameToken,
      });

      // Valida o FRAME_TOKEN compartilhado (autenticação server-to-server)
      const expectedFrameToken = process.env.FRAME_TOKEN;
      if (!expectedFrameToken || frameToken !== expectedFrameToken) {
        console.log('[EMBED-AUTH] ERRO: frameToken inválido ou não configurado');
        return res.status(StatusCodes.UNAUTHORIZED).json({
          errors: { default: 'Token de autenticação inválido' }
        });
      }

      if (!embedToken || !login || !redirectUrl) {
        console.log('[EMBED-AUTH] ERRO: parâmetros faltando');
        return res.status(StatusCodes.BAD_REQUEST).json({
          errors: { default: 'Parâmetros obrigatórios: embedToken, login, redirectUrl' }
        });
      }

      // Registra o token efêmero no cache com dados adicionais
      this.authCases.registerEmbedToken(embedToken, login, redirectUrl, empresa, unidade, grupo);

      console.log('[EMBED-AUTH] Token registrado com sucesso para:', login);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Token registrado com sucesso'
      });
    } catch (error) {
      console.error('[EMBED-AUTH] ERRO em registerEmbedToken:', error);
      handleError(error, res);
    }
  }

  /**
   * Inicializa a sessão do usuário via embed token
   * Navegador acessa diretamente, valida token, seta cookie e redireciona
   */
  async authInit(req: Request, res: Response) {
    try {
      const { token } = req.query;

      console.log('[EMBED-AUTH] authInit chamado:', {
        token: typeof token === 'string' ? token.substring(0, 8) + '...' : token,
        userAgent: req.headers['user-agent']?.substring(0, 50),
      });

      if (!token || typeof token !== 'string') {
        console.log('[EMBED-AUTH] ERRO: token não fornecido ou tipo inválido');
        return res.status(StatusCodes.BAD_REQUEST).send(`
          <html>
            <body>
              <h1>Erro de Autenticação</h1>
              <p>Token não fornecido ou inválido.</p>
            </body>
          </html>
        `);
      }

      // Valida e consome o token efêmero
      const tokenData = this.authCases.validateAndConsumeEmbedToken(token);

      if (!tokenData) {
        console.log('[EMBED-AUTH] ERRO: token não encontrado ou expirado:', token.substring(0, 8) + '...');
        return res.status(StatusCodes.UNAUTHORIZED).send(`
          <html>
            <body>
              <h1>Erro de Autenticação</h1>
              <p>Token expirado ou inválido. Por favor, tente novamente.</p>
            </body>
          </html>
        `);
      }

      console.log('[EMBED-AUTH] Token validado com sucesso:', {
        login: tokenData.login,
        empresa: tokenData.empresa,
        unidade: tokenData.unidade,
        grupo: tokenData.grupo,
        redirectUrl: tokenData.redirectUrl,
      });

      // Cria a sessão do usuário com os dados de empresa/grupo
      const session = await this.authCases.createEmbedSession(
        tokenData.login,
        tokenData.empresa,
        tokenData.unidade,
        tokenData.grupo
      );

      console.log('[EMBED-AUTH] Sessão criada:', {
        username: session.username,
        companyId: session.companyId,
        groupId: session.groupId,
      });

      // Define o cookie httpOnly (isso é first-party, não cross-site!)
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('accessToken', session.accessToken, {
        httpOnly: true,
        secure: isProduction,
        maxAge: this.getMsUntilMidnight(),
        sameSite: 'lax', // Pode ser 'lax' pois é first-party
      });

      console.log('[EMBED-AUTH] Cookie setado, redirecionando para:', tokenData.redirectUrl);

      // Redireciona de volta para o Sistema A
      return res.redirect(tokenData.redirectUrl);
    } catch (error) {
      console.error('[EMBED-AUTH] ERRO em authInit:', error);
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
