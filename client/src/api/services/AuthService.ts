import { IAuthResult, IValidateRequest } from '../../entities/Auth';
import { Api } from '../axios-config';



export const AuthService = {
  /**
   * Autentica via frame token do Corpo Bueno
   */
  authFrameToken: async (token: string): Promise<IAuthResult | Error> => {
    try {
      const { data } = await Api.post('/auth/frame-token', { token });
      return data;
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao autenticar com token.');
    }
  },

  /**
   * Autentica via senha de administrador (método reserva)
   */
  authAdminPassword: async (password: string): Promise<IAuthResult | Error> => {
    try {
      const { data } = await Api.post('/auth/admin', { password });
      return data;
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Senha incorreta.');
    }
  },

  /**
   * Valida a sessão atual
   */
  validate: async (postUser: IValidateRequest): Promise<IAuthResult | Error> => {
    try {
      const { data } = await Api.post('/auth/validate', postUser);
      return data;
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao validar sessão.');
    }
  },

  /**
   * Encerra a sessão
   */
  logout: async (): Promise<boolean> => {
    try {
      await Api.post('/auth/logout');
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
};
