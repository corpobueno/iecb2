import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Environment } from '../api/axios-config/environment';
import { setSessionStorage } from '../utils/functions';

interface IUser {
  login: string;
  nome: string;
  empresa: number;
  grupo: number;
}

interface IAuthContextData {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithAdminPassword: (password: string) => Promise<boolean>;
}

const AuthContext = createContext<IAuthContextData>({} as IAuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Login via senha de administrador (fallback)
   */
  const loginWithAdminPassword = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${Environment.URL_BASE}/auth/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.errors?.default || 'Senha incorreta');
        return false;
      }

      const data = await response.json();

      const adminUser: IUser = {
        login: data.username,
        nome: data.name,
        empresa: data.companyId,
        grupo: data.groupId,
      };

      setUser(adminUser);
      setError(null);
      sessionStorage.setItem('iecb_user', JSON.stringify(adminUser));

      return true;
    } catch {
      setError('Erro ao autenticar');
      return false;
    }
  };

  /**
   * Troca o authorization code por uma sessão, chamando o backend IECB
   * que valida o code server-to-server com o Corpo Bueno.
   */
  const exchangeCode = async (code: string) => {
    console.log('[Auth] Code detectado na URL, iniciando exchange...');
    try {
      const response = await fetch(`${Environment.URL_BASE}/auth/exchange?code=${encodeURIComponent(code)}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.message || errorData.errors?.default || 'Código de autenticação inválido';
        console.error('[Auth] Falha no exchange:', response.status, msg);
        setError(msg);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[Auth] Exchange bem-sucedido, usuário:', data.username);

      const authenticatedUser: IUser = {
        login: data.username,
        nome: data.name,
        empresa: data.companyId,
        grupo: data.groupId,
      };

      setUser(authenticatedUser);
      setError(null);
      setSessionStorage('username', data.username);
      setSessionStorage('groupId', data.groupId);
      setSessionStorage('companyId', data.companyId);
      sessionStorage.setItem('iecb_user', JSON.stringify(authenticatedUser));
    } catch (err) {
      console.error('[Auth] Erro de conexão no exchange:', err);
      setError('Erro de conexão ao autenticar');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      // Limpa o code da URL para não ficar exposto no histórico
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      window.history.replaceState({}, '', url.pathname + url.search);

      exchangeCode(code);
      return;
    }

    // Sem code: verifica sessão local existente
    const storedUser = sessionStorage.getItem('iecb_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        console.log('[Auth] Sessão local restaurada:', parsed.login);
        setUser(parsed);
      } catch {
        console.warn('[Auth] Sessão local inválida, removendo');
        sessionStorage.removeItem('iecb_user');
      }
    } else {
      console.log('[Auth] Nenhum code na URL e nenhuma sessão local');
    }

    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      loginWithAdminPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
