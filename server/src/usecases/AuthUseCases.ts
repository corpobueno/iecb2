// src/usecases/AuthUseCases.ts
import { AppError } from '../utils/AppError';
import { AuthService } from '../services/AuthService';
import { StatusCodes } from 'http-status-codes';

interface IAuthResult {
  username: string;
  accessToken: string;
  groupId: number;
  companyId: number;
  name: string;
}

interface IValidateResult  extends Omit<IAuthResult, 'accessToken'>  {
  accessToken: string | null;
}

export class AuthUseCases {
  constructor() { }

  /**
   * Troca um authorization code por uma sessão autenticada.
   * Valida o code diretamente com o backend do Corpo Bueno (server-to-server).
   */
  async exchangeCode(code: string): Promise<IAuthResult> {
    const corpoBuenoApiUrl = process.env.CORPO_BUENO_API_URL;
    if (!corpoBuenoApiUrl) {
      throw new AppError('CORPO_BUENO_API_URL não configurada', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    console.log('[AuthUseCases] Validando code com Corpo Bueno em:', corpoBuenoApiUrl);

    const response = await fetch(`${corpoBuenoApiUrl}/auth/validate-frame-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: code }),
    });

    if (!response.ok) {
      const status = response.status;
      console.error('[AuthUseCases] Corpo Bueno retornou erro:', status);
      if (status === 401) {
        throw new AppError('Código de autenticação inválido ou expirado', StatusCodes.UNAUTHORIZED);
      }
      throw new AppError('Erro ao validar código com o sistema principal', status);
    }

    const userData = await response.json();
    const { login, empresa, grupo, nome } = userData;
    console.log('[AuthUseCases] Corpo Bueno validou com sucesso:', { login, empresa, grupo });

    if (!login || !empresa || !grupo) {
      throw new AppError('Dados de usuário incompletos retornados pelo sistema principal', StatusCodes.BAD_REQUEST);
    }

    const accessToken = AuthService.generateToken(login, empresa, grupo);

    if (accessToken === 'JWT_SECRET_NOT_FOUND') {
      throw new AppError('Erro ao gerar token de acesso', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    console.log('[AuthUseCases] JWT local gerado para:', login);

    return {
      username: login,
      accessToken,
      groupId: grupo,
      companyId: empresa,
      name: nome || login,
    };
  }

  async validate(user: any, body: any): Promise<IValidateResult> {

    const sameValues = AuthService.compareValues(body, user);
    const { usuario, empresa, grupo } = body;

    if (sameValues) {

      return {
        username: usuario,
        accessToken: null,
        groupId: grupo,
        companyId: empresa,
        name: usuario,
      };

    }

    console.log('[AuthUseCases] Valores não correspondem. Body:', body, 'User:', user);

    const accessToken = AuthService.generateToken(
      usuario,
      empresa,
      grupo
    );

    if (accessToken === 'JWT_SECRET_NOT_FOUND') {
      throw new AppError('Erro ao gerar token de acesso', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return {
      username: usuario,
      accessToken,
      groupId: grupo,
      companyId: empresa,
      name: usuario,
    };

  }

  /**
   * Autentica via senha de administrador
   * Método reserva para acesso direto
   */
  async authAdminPassword(password: string): Promise<IAuthResult> {
    const adminPass = process.env.ADM_PASS;

    if (!adminPass) {
      throw new AppError('Senha de administrador não configurada', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    if (password !== adminPass) {
      throw new AppError('Senha de administrador incorreta', StatusCodes.UNAUTHORIZED);
    }

    const accessToken = AuthService.generateToken('admin', 1, 1);

    if (accessToken === 'JWT_SECRET_NOT_FOUND') {
      throw new AppError('Erro ao gerar token de acesso', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return {
      username: 'admin',
      accessToken,
      groupId: 1,
      companyId: 1,
      name: 'Administrador',
    };
  }
}
