// src/usecases/AuthUseCases.ts
import { AppError } from '../utils/AppError';
import { AuthService } from '../services/AuthService';
import { StatusCodes } from 'http-status-codes';

// URL do backend do Corpo Bueno para validar frame tokens
const CORPO_BUENO_API_URL = process.env.CORPO_BUENO_API_URL || 'https://cb.sysnode.com.br';

interface ICorpoBuenoUser {
  login: string;
  nome: string;
  email: string;
  empresa: number;
  unidade: number;
  grupo: number;
}

interface IAuthResult {
  username: string;
  accessToken: string;
  groupId: number;
  companyId: number;
  name: string;
}

export class AuthUseCases {
  constructor() { }

  /**
   * Autentica via frame token do Corpo Bueno
   * Valida o token com o backend do Corpo Bueno e gera JWT local
   */
  async authFrameToken(token: string): Promise<IAuthResult | Error> {
    try {
      // Valida o token com o backend do Corpo Bueno
      const response = await fetch(`${CORPO_BUENO_API_URL}/auth/validate-frame-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AppError(
          errorData.message || 'Token inválido ou expirado',
          StatusCodes.UNAUTHORIZED
        );
      }

      const userData: ICorpoBuenoUser = await response.json();

      // Gera JWT local com os dados do usuário do Corpo Bueno
      const accessToken = AuthService.generateToken(
        userData.login,
        userData.empresa,
        0, // lite - não usado para frame auth
        userData.grupo
      );

      if (accessToken === 'JWT_SECRET_NOT_FOUND') {
        throw new AppError('Erro ao gerar token de acesso', StatusCodes.INTERNAL_SERVER_ERROR);
      }

      return {
        username: userData.login,
        accessToken,
        groupId: userData.grupo,
        companyId: userData.empresa,
        name: userData.nome,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao validar frame token:', error);
      throw new AppError('Erro ao validar autenticação', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Autentica via iframe de domínio autorizado
   * Cria sessão para acesso via iframe autorizado com o login do usuário
   */
  async authIframe(referrer: string, login?: string): Promise<IAuthResult | Error> {
    try {
      const username = login || 'iframe-user';

      // Gera JWT com dados do usuário passado pelo iframe
      const accessToken = AuthService.generateToken(
        username,
        1, // companyId padrão
        0, // lite
        1  // groupId padrão
      );

      if (accessToken === 'JWT_SECRET_NOT_FOUND') {
        throw new AppError('Erro ao gerar token de acesso', StatusCodes.INTERNAL_SERVER_ERROR);
      }

      return {
        username,
        accessToken,
        groupId: 1,
        companyId: 1,
        name: username,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao autenticar iframe:', error);
      throw new AppError('Erro ao autenticar via iframe', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Autentica via senha de administrador
   * Método reserva para acesso direto (será removido no futuro)
   */
  async authAdminPassword(password: string): Promise<IAuthResult | Error> {
    const adminPass = process.env.ADM_PASS;
    console.log('Admin pass from env:', adminPass, password); // Log para depuração

    if (!adminPass) {
      throw new AppError('Senha de administrador não configurada', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    if (password !== adminPass) {
      throw new AppError('Senha de administrador incorreta', StatusCodes.UNAUTHORIZED);
    }

    // Gera JWT com dados de admin
    const accessToken = AuthService.generateToken(
      'admin',
      1, // companyId padrão
      0, // lite
      1  // groupId admin
    );

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
