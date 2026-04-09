import { IAuthResult } from '../../entities/Auth';
import { Api } from '../axios-config';

export const AuthService = {
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
