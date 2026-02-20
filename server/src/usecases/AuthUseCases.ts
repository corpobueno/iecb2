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
   * Autentica via postMessage do Sistema A (Corpo Bueno)
   * Recebe frameToken, usuario, empresa, grupo - valida e gera JWT
   */
  async authViaPostMessage(
    frameToken: string,
    usuario: string,
    empresa: number,
    grupo: number
  ): Promise<IAuthResult> {
    // Valida o FRAME_TOKEN compartilhado
    const expectedFrameToken = process.env.FRAME_TOKEN;
    if (!expectedFrameToken || frameToken !== expectedFrameToken) {
      throw new AppError('Token de frame inválido', StatusCodes.UNAUTHORIZED);
    }

    if (!usuario || !empresa || !grupo) {
      throw new AppError('Dados de autenticação incompletos: usuario=' + usuario + ', empresa=' + empresa + ', grupo=' + grupo, StatusCodes.BAD_REQUEST);
    }

    // Gera JWT local
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
