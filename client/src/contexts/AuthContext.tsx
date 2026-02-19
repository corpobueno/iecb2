import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ICorpoBuenoUser } from '../api/services/CorpoBuenoAuthService';
import { Environment } from '../api/axios-config/environment';

interface IAuthContextData {
  user: ICorpoBuenoUser | null;
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
  const [user, setUser] = useState<ICorpoBuenoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const authenticateWithToken = async () => {
      // Verifica se está dentro de um iframe
      const isInIframe = window.self !== window.top;

      // Lista de domínios autorizados
      const allowedDomains = [
        'app.corpobueno.com.br',
        'app.institutocorpobueno.com.br',
        'localhost:5173', // Para desenvolvimento
      ];

      // Verifica se o referrer é de um domínio autorizado
      const referrer = document.referrer;
      const isFromAllowedDomain = allowedDomains.some(domain =>
        referrer.includes(domain)
      );

      // Se não está em iframe de domínio autorizado, exige autenticação
      if (!isInIframe || !isFromAllowedDomain) {
        // Debug: mostra informações na tela
        setError(`Acesso não autorizado. [DEBUG] isInIframe: ${isInIframe}, referrer: "${referrer}", isFromAllowedDomain: ${isFromAllowedDomain}`);
        setIsLoading(false);
        return;
      }

      try {
        // Captura o login da URL (passado pelo Corpo Bueno)
        const urlParams = new URLSearchParams(window.location.search);
        const login = urlParams.get('login') || 'iframe-user';

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
          setError(errorData.errors?.default || 'Erro ao autenticar');
          setIsLoading(false);
          return;
        }

        const userData = await response.json();

        // Cria objeto de usuário compatível com ICorpoBuenoUser
        const authenticatedUser: ICorpoBuenoUser = {
          login: userData.username,
          nome: userData.name || userData.username,
          email: userData.email || '',
          empresa: userData.companyId,
          unidade: 1,
          grupo: userData.groupId,
        };

        // Armazena dados do usuário
        setUser(authenticatedUser);

        // Armazena na sessionStorage para persistir durante a sessão do iframe
        sessionStorage.setItem('iecb_user', JSON.stringify(authenticatedUser));

        setError(null);
        setIsLoading(false);
      } catch (err) {
        setError('Erro ao autenticar com o sistema');
        setIsLoading(false);
      }
    };

    // DEBUG: Limpa sessionStorage temporariamente para testar
    sessionStorage.removeItem('iecb_user');

    // Log de debug
    console.log('[DEBUG] Iniciando autenticação...');
    console.log('[DEBUG] isInIframe:', window.self !== window.top);
    console.log('[DEBUG] referrer:', document.referrer);

    authenticateWithToken();
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, error, loginWithAdminPassword }}>
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
