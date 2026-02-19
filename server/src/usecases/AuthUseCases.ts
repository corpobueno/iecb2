// src/usecases/AuthUseCases.ts
import { AppError } from '../utils/AppError';
import { AuthService } from '../services/AuthService';
import { StatusCodes } from 'http-status-codes';

// URL do backend do Corpo Bueno para validar frame tokens
const CORPO_BUENO_API_URL = process.env.CORPO_BUENO_API_URL || 'https://cb.sysnode.com.br';

// Cache em memória para tokens efêmeros (TTL: 60 segundos)
interface EmbedTokenData {
  login: string;
  createdAt: number;
  redirectUrl: string;
  empresa?: number;
  unidade?: number;
  grupo?: number;
}
const embedTokenCache = new Map<string, EmbedTokenData>();

// Limpa tokens expirados a cada 30 segundos
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of embedTokenCache.entries()) {
    if (now - data.createdAt > 60000) { // 60 segundos
      embedTokenCache.delete(token);
    }
  }
}, 30000);

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

  /**
   * Registra um token efêmero para autenticação via embed (server-to-server)
   * Chamado pelo Backend do Sistema A
   */
  registerEmbedToken(
    embedToken: string,
    login: string,
    redirectUrl: string,
    empresa?: number,
    unidade?: number,
    grupo?: number
  ): void {
    console.log('[EMBED-AUTH] Registrando token no cache:', {
      tokenId: embedToken.substring(0, 8) + '...',
      login,
      cacheSize: embedTokenCache.size,
    });

    embedTokenCache.set(embedToken, {
      login,
      createdAt: Date.now(),
      redirectUrl,
      empresa,
      unidade,
      grupo,
    });

    console.log('[EMBED-AUTH] Cache atualizado, novo tamanho:', embedTokenCache.size);
  }

  /**
   * Valida e consome um token efêmero de embed
   * Retorna os dados se válido, null se inválido/expirado
   */
  validateAndConsumeEmbedToken(embedToken: string): {
    login: string;
    redirectUrl: string;
    empresa?: number;
    unidade?: number;
    grupo?: number;
  } | null {
    console.log('[EMBED-AUTH] Validando token:', {
      tokenId: embedToken.substring(0, 8) + '...',
      cacheSize: embedTokenCache.size,
      tokensNaCache: Array.from(embedTokenCache.keys()).map(k => k.substring(0, 8) + '...'),
    });

    const data = embedTokenCache.get(embedToken);

    if (!data) {
      console.log('[EMBED-AUTH] Token NÃO encontrado no cache');
      return null;
    }

    const ageMs = Date.now() - data.createdAt;
    console.log('[EMBED-AUTH] Token encontrado, idade:', ageMs, 'ms');

    // Verifica se expirou (60 segundos)
    if (ageMs > 60000) {
      console.log('[EMBED-AUTH] Token EXPIRADO');
      embedTokenCache.delete(embedToken);
      return null;
    }

    // Consome o token (uso único)
    embedTokenCache.delete(embedToken);
    console.log('[EMBED-AUTH] Token consumido (uso único), cache size:', embedTokenCache.size);

    return {
      login: data.login,
      redirectUrl: data.redirectUrl,
      empresa: data.empresa,
      unidade: data.unidade,
      grupo: data.grupo,
    };
  }

  /**
   * Cria sessão para usuário autenticado via embed
   */
  async createEmbedSession(
    login: string,
    empresa?: number,
    unidade?: number,
    grupo?: number
  ): Promise<IAuthResult> {
    const companyId = empresa ?? 1;
    const groupId = grupo ?? 1;

    const accessToken = AuthService.generateToken(
      login,
      companyId,
      0, // lite
      groupId
    );

    if (accessToken === 'JWT_SECRET_NOT_FOUND') {
      throw new AppError('Erro ao gerar token de acesso', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return {
      username: login,
      accessToken,
      groupId,
      companyId,
      name: login,
    };
  }
}
