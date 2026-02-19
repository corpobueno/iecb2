import { AxiosResponse, AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  errors?: { default?: string } | Array<{ message: string }>;
  code?: string;
  expectedLogin?: string;
  currentLogin?: string;
}

export const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

export const errorInterceptor = (error: AxiosError<ErrorResponse>) => {
  if (error.message === 'Network Error') {
    return Promise.reject(new Error('Erro de conexão.'));
  }

  // Trata erro de usuário diferente do esperado (403 com code USER_MISMATCH)
  if (error.response?.status === 403 && error.response?.data?.code === 'USER_MISMATCH') {
    console.log('[ResponseInterceptor] Usuário diferente do esperado:', {
      expected: error.response.data.expectedLogin,
      current: error.response.data.currentLogin,
    });
    // Dispara evento para solicitar re-autenticação
    window.dispatchEvent(new CustomEvent('auth:user-mismatch', {
      detail: {
        expectedLogin: error.response.data.expectedLogin,
        currentLogin: error.response.data.currentLogin,
      }
    }));
    return Promise.reject(new Error('Usuário diferente do esperado. Re-autenticando...'));
  }

  if (error.response?.status === 401) {
    const isValidateRequest = error.config?.url?.includes('/auth/validate');
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    // Para requisições de auth, retorna a mensagem original do servidor
    if (isValidateRequest || isLoginRequest) {
      const message = error.response?.data?.message || 'Não autorizado.';
      return Promise.reject(new Error(message));
    }

    // Para outras requisições, dispara evento de sessão expirada
    window.dispatchEvent(new CustomEvent('auth:expired'));
    return Promise.reject(new Error('Sessão expirada.'));
  }

  if (error.response?.status === 422) {
    let message = (error.response?.data?.message || 'Erro de validação') + ':';

    // Verifica se há uma lista de erros para processar
    if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
      error.response.data.errors.forEach((item) => {
        message += `\n${item.message}`;
      });
    }

    return Promise.reject(new Error(message));
  }

  // Para outros erros, tenta extrair a mensagem de erro da resposta
  const errorMessage = error.response?.data?.message
    || (typeof error.response?.data === 'string' ? error.response?.data : null)
    || error.message
    || 'Erro desconhecido.';

  return Promise.reject(new Error(errorMessage));
};