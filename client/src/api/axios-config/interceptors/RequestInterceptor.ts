import { InternalAxiosRequestConfig } from 'axios';

/**
 * Obtém o token do sessionStorage
 */
const getTokenFromStorage = () => {
  return sessionStorage.getItem('iecb_token');
};

/**
 * Obtém os dados do usuário do sessionStorage
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
  const token = getTokenFromStorage();
  const user = getUserFromStorage();

  // Adiciona o token no header Authorization
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Adiciona empresa e grupo aos headers
  if (user?.empresa) {
    config.headers['companyid'] = user.empresa;
  }

  if (user?.grupo) {
    config.headers['groupid'] = user.grupo;
  }

  return config;
};
