/**
 * Serviço para validar token de autenticação do projeto Corpo Bueno
 * Usado quando o app é aberto via iframe do sistema principal
 */

// URL do backend do Corpo Bueno
const CORPO_BUENO_API_URL = import.meta.env.VITE_CORPO_BUENO_API_URL || 'https://cb.sysnode.com.br';

export interface ICorpoBuenoUser {
  login: string;
  nome: string;
  email: string;
  empresa: number;
  unidade: number;
  grupo: number;
}

export const CorpoBuenoAuthService = {
  /**
   * Valida o token temporário recebido via URL
   * @param token Token temporário do Corpo Bueno
   * @returns Dados do usuário se válido, Error se inválido
   */
  validateFrameToken: async (token: string): Promise<ICorpoBuenoUser | Error> => {
    try {
      const response = await fetch(`${CORPO_BUENO_API_URL}/auth/validate-frame-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json();
        return new Error(error.message || 'Token inválido ou expirado');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Erro ao validar token do Corpo Bueno:', error);
      return new Error('Erro ao validar autenticação');
    }
  },

  /**
   * Extrai o token da URL
   * @returns Token se presente, null caso contrário
   */
  getTokenFromUrl: (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('authToken');
  },

  /**
   * Remove o token da URL sem recarregar a página
   */
  clearTokenFromUrl: (): void => {
    const url = new URL(window.location.href);
    url.searchParams.delete('authToken');
    window.history.replaceState({}, '', url.toString());
  },
};
