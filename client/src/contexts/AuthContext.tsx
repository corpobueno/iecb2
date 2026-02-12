import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CorpoBuenoAuthService, ICorpoBuenoUser } from '../api/services/CorpoBuenoAuthService';
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
      // Captura o token da URL
      const token = CorpoBuenoAuthService.getTokenFromUrl();

      if (!token) {
        setError('Acesso não autorizado. Este sistema só pode ser acessado através do sistema principal.');
        setIsLoading(false);
        return;
      }

      // Valida o token com o backend do Corpo Bueno
      const result = await CorpoBuenoAuthService.validateFrameToken(token);

      if (result instanceof Error) {
        setError(result.message);
        setIsLoading(false);
        return;
      }

      // Token válido - armazena dados do usuário
      setUser(result);

      // Remove o token da URL por segurança
      CorpoBuenoAuthService.clearTokenFromUrl();

      // Armazena na sessionStorage para persistir durante a sessão do iframe
      sessionStorage.setItem('iecb_user', JSON.stringify(result));

      setIsLoading(false);
    };

    // Verifica se já tem usuário na sessionStorage (para navegação interna)
    const storedUser = sessionStorage.getItem('iecb_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoading(false);
        return;
      } catch {
        sessionStorage.removeItem('iecb_user');
      }
    }

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
