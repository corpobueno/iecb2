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

/**
 * Obtém o token do sessionStorage
 * Usado como fallback quando cookies não funcionam (cross-site iframe)
 */
const getTokenFromStorage = () => {
  return sessionStorage.getItem('iecb_token');
};

/**
 * Obtém o login esperado da URL (passado pelo Sistema A)
 * Usado para verificar se a sessão atual é do usuário correto
 */
const getExpectedLoginFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('login') || sessionStorage.getItem('iecb_expected_login');
};

export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const user = getUserFromStorage();
  const token = getTokenFromStorage();
  const expectedLogin = getExpectedLoginFromUrl();

  // Adiciona o token no header Authorization (fallback para quando cookie não funciona)
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Adiciona empresa e grupo aos headers se existirem
  if (user?.empresa) {
    config.headers['companyid'] = user.empresa;
  }

  if (user?.grupo) {
    config.headers['groupid'] = user.grupo;
  }

  // Adiciona o login esperado para verificação no backend
  if (expectedLogin) {
    config.headers['x-expected-login'] = expectedLogin;
  }

  return config;
};
