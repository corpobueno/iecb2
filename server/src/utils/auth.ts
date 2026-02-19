import dotenv from 'dotenv';
import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/AuthService';

dotenv.config();

export const ensureAuthenticated: RequestHandler = async (req, res, next) => {
    // Tenta obter o token do cookie primeiro, depois do header Authorization (fallback)
    let accessToken = req.cookies.accessToken;

    if (!accessToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }
    }

    // Verifica se o accessToken existe
    if (!accessToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        errors: { default: 'Sessão expirada' }
      });
    }

    // Verifica o token usando jwtVerify
    const jwtData = AuthService.decodeToken(accessToken);

    if (jwtData === 'JWT_SECRET_NOT_FOUND') {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        errors: { default: 'Erro ao verificar o token' }
      });
    } else if (jwtData === 'INVALID_TOKEN') {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        errors: { default: 'Token inválido' }
      });
    }

    // Armazena as informações do usuário no objeto req.user
    req.user = {
      username: jwtData.username,
      groupId: (jwtData as any).groupId,
    };

    return next();
  };
  