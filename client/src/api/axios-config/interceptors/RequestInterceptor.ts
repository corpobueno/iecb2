import { InternalAxiosRequestConfig } from 'axios';

/**
 * Obtém os dados do usuário do sessionStorage
 * Usado pelo interceptor que não pode usar hooks do React
 */
const getUserFromStorage = () => {
  try {
    const storedUser = sessionStorage.getItem('iecb_user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch {
    // Ignora erros de parse
  }
  return null;
};

export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const user = getUserFromStorage();

  // Adiciona empresa e grupo aos headers se existirem
  if (user?.empresa) {
    config.headers['companyid'] = user.empresa;
  }

  if (user?.grupo) {
    config.headers['groupid'] = user.grupo;
  }

  return config;
};
