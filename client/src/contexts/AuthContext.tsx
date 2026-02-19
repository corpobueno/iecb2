import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ICorpoBuenoUser } from '../api/services/CorpoBuenoAuthService';
import { Environment } from '../api/axios-config/environment';

interface IAuthContextData {
  user: ICorpoBuenoUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  expectedLogin: string | null;
  loginWithAdminPassword: (password: string) => Promise<boolean>;
  requestReAuth: () => void;
}

const AuthContext = createContext<IAuthContextData>({} as IAuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ICorpoBuenoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expectedLogin, setExpectedLogin] = useState<string | null>(null);

  /**
   * Solicita re-autenticação ao Sistema A (parent)
   */
  const requestReAuth = () => {
    console.log('[AuthContext] Solicitando re-autenticação ao parent');
    // Limpa sessão atual
    sessionStorage.removeItem('iecb_user');
    sessionStorage.removeItem('iecb_token');
    setUser(null);
    setIsLoading(true);

    // Envia mensagem ao parent solicitando nova autenticação
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'AUTH_REQUIRED',
        message: 'Sessão expirada ou usuário diferente',
        expectedLogin: expectedLogin,
        source: 'IECB_AUTH'
      }, '*');
    }
  };

  /**
   * Login via senha de administrador (método reserva)
   */
  const loginWithAdminPassword = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${Environment.URL_BASE}/auth/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.errors?.default || 'Senha incorreta');
        return false;
      }

      const userData = await response.json();

      // Armazena o token para uso em requisições (fallback quando cookie não funciona)
      if (userData.accessToken) {
        sessionStorage.setItem('iecb_token', userData.accessToken);
      }

      // Cria objeto de usuário compatível com ICorpoBuenoUser
      const adminUser: ICorpoBuenoUser = {
        login: userData.username,
        nome: userData.name,
        email: '',
        empresa: userData.companyId,
        unidade: 1,
        grupo: userData.groupId,
      };

      setUser(adminUser);
      setError(null);
      sessionStorage.setItem('iecb_user', JSON.stringify(adminUser));

      return true;
    } catch (err) {
      setError('Erro ao autenticar');
      return false;
    }
  };

  // Escuta evento de user mismatch para re-autenticar
  useEffect(() => {
    const handleUserMismatch = () => {
      console.log('[AuthContext] Evento user-mismatch recebido, solicitando re-auth');
      requestReAuth();
    };

    window.addEventListener('auth:user-mismatch', handleUserMismatch);
    return () => {
      window.removeEventListener('auth:user-mismatch', handleUserMismatch);
    };
  }, [expectedLogin]);

  useEffect(() => {
    const authenticateWithToken = async () => {
      // Captura o login esperado da URL (passado pelo Sistema A)
      const urlParams = new URLSearchParams(window.location.search);
      const loginFromUrl = urlParams.get('login');

      if (loginFromUrl) {
        setExpectedLogin(loginFromUrl);
        sessionStorage.setItem('iecb_expected_login', loginFromUrl);
        console.log('[AuthContext] Login esperado da URL:', loginFromUrl);
      } else {
        // Tenta recuperar do sessionStorage
        const storedExpectedLogin = sessionStorage.getItem('iecb_expected_login');
        if (storedExpectedLogin) {
          setExpectedLogin(storedExpectedLogin);
        }
      }

      // Verifica se já tem usuário na sessionStorage
      const storedUser = sessionStorage.getItem('iecb_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Verifica se o usuário armazenado é o esperado
          if (loginFromUrl && parsedUser.login !== loginFromUrl) {
            console.log('[AuthContext] Usuário diferente do esperado:', {
              stored: parsedUser.login,
              expected: loginFromUrl
            });
            // Limpa sessão e solicita re-autenticação
            sessionStorage.removeItem('iecb_user');
            sessionStorage.removeItem('iecb_token');
            requestReAuth();
            return;
          }

          setUser(parsedUser);
          setIsLoading(false);
          return;
        } catch {
          sessionStorage.removeItem('iecb_user');
        }
      }

      // Verifica se está dentro de um iframe
      const isInIframe = window.self !== window.top;

      // Lista de domínios autorizados
      const allowedDomains = [
        'app.corpobueno.com.br',
        'app.institutocorpobueno.com.br',
        'web.sysnode.com.br',
        'localhost:5173',
        'localhost:5174',
      ];

      // Verifica se o referrer é de um domínio autorizado
      const referrer = document.referrer;
      const isFromAllowedDomain = allowedDomains.some(domain =>
        referrer.includes(domain)
      );

      // Se não está em iframe de domínio autorizado, exige autenticação manual
      if (!isInIframe || !isFromAllowedDomain) {
        setError(`[DEBUG] isInIframe: ${isInIframe}, referrer: "${referrer || '(vazio)'}", isAllowed: ${isFromAllowedDomain}`);
        setIsLoading(false);
        return;
      }

      try {
        const login = loginFromUrl || 'iframe-user';

        // Autentica automaticamente via iframe autorizado
        const response = await fetch(`${Environment.URL_BASE}/auth/iframe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ referrer, login }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setError(`[DEBUG IFRAME] Status: ${response.status}, Erro: ${errorData.errors?.default || 'desconhecido'}, Referrer: "${referrer}"`);
          setIsLoading(false);
          return;
        }

        const userData = await response.json();

        // Armazena o token
        if (userData.accessToken) {
          sessionStorage.setItem('iecb_token', userData.accessToken);
        }

        // Cria objeto de usuário
        const authenticatedUser: ICorpoBuenoUser = {
          login: userData.username,
          nome: userData.name || userData.username,
          email: userData.email || '',
          empresa: userData.companyId,
          unidade: 1,
          grupo: userData.groupId,
        };

        setUser(authenticatedUser);
        sessionStorage.setItem('iecb_user', JSON.stringify(authenticatedUser));
        setError(null);
        setIsLoading(false);
      } catch (err) {
        setError('Erro ao autenticar com o sistema');
        setIsLoading(false);
      }
    };

    authenticateWithToken();
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      error,
      expectedLogin,
      loginWithAdminPassword,
      requestReAuth
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
