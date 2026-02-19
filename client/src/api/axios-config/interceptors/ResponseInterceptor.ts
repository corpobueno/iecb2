import { AxiosResponse, AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  errors?: { default?: string } | Array<{ message: string }>;
}

export const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

export const errorInterceptor = (error: AxiosError<ErrorResponse>) => {
  if (error.message === 'Network Error') {
    return Promise.reject(new Error('Erro de conexão.'));
  }

  if (error.response?.status === 401) {
    // Sessão expirada
    sessionStorage.removeItem('iecb_user');
    sessionStorage.removeItem('iecb_token');
    window.dispatchEvent(new CustomEvent('auth:expired'));
    return Promise.reject(new Error('Sessão expirada.'));
  }

  if (error.response?.status === 422) {
    let message = (error.response?.data?.message || 'Erro de validação') + ':';

    if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
      error.response.data.errors.forEach((item) => {
        message += `\n${item.message}`;
      });
    }

    return Promise.reject(new Error(message));
  }

  const errorMessage = error.response?.data?.message
    || (typeof error.response?.data === 'string' ? error.response?.data : null)
    || error.message
    || 'Erro desconhecido.';

  return Promise.reject(new Error(errorMessage));
};
