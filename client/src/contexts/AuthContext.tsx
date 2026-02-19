import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { Environment } from '../api/axios-config/environment';
import { AuthService } from '../api/services/AuthService';

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
  const authAttemptedRef = useRef(false);
  const authCompletedRef = useRef(false); // Rastreia se autenticação foi completada

  /**
   * Login via senha de administrador (fallback)
   */
  const loginWithAdminPassword = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${Environment.URL_BASE}/auth/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.errors?.default || 'Senha incorreta');
        return false;
      }

      const data = await response.json();

      sessionStorage.setItem('iecb_token', data.accessToken);

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


  type ValidateResult =
    | { status: 'authenticated'; username: string; groupId: number }
    | { status: 'different_user'; currentUsername: string }
    | { status: 'not_authenticated' }
    | { status: 'error'; message: string };

  const validate = async (usuario: string): Promise<ValidateResult> => {
    try {
      const response = await AuthService.validate();

      console.log('[Auth] Resultado da validação:', response, 'usuario recebido:', usuario);

      if (response instanceof Error) {
        // Verifica se é erro 401 (não autenticado) - inclui mensagem do interceptor
        const errorMessage = response.message || '';
        const is401Error = errorMessage.includes('401') ||
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('não autenticado') ||
          errorMessage.toLowerCase().includes('sessão expirada');

        if (is401Error) {
          console.log('[Auth] Usuário não autenticado (401):', errorMessage);
          return { status: 'not_authenticated' };
        }
        return { status: 'error', message: errorMessage };
      }

      // Usuário autenticado - verifica se é o mesmo
      if (usuario === response.username) {
        console.log('[Auth] Mesmo usuário já autenticado:', usuario);
        sessionStorage.setItem('username', JSON.stringify(response.username));
        sessionStorage.setItem('groupId', JSON.stringify(response.groupId));
        return { status: 'authenticated', username: response.username, groupId: response.groupId };
      }

      // Usuário diferente - precisa reautenticar
      console.log('[Auth] Usuário diferente detectado. Atual:', response.username, 'Recebido:', usuario);
      return { status: 'different_user', currentUsername: response.username };
    } catch (err) {
      console.error('[Auth] Erro ao validar:', err);
      return { status: 'error', message: 'Erro ao validar sessão' };
    }
  };

  /**
   * Autentica via postMessage do Sistema A
   */
  const authenticateViaPostMessage = async (
    frameToken: string,
    usuario: string,
    empresa: number,
    grupo: number
  ) => {
    console.log('[Auth] Autenticando via postMessage:', { usuario, empresa, grupo });




    try {
      const response = await fetch(`${Environment.URL_BASE}/auth/post-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frameToken, usuario, empresa, grupo }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Auth] Erro na autenticação:', errorData);

        // Mensagens de erro específicas para o cliente
        let errorMessage = 'Erro na autenticação';
        if (response.status === 401) {
          // Token inválido - token recebido não corresponde ao do .env
          errorMessage = errorData.errors?.default || 'Token de autenticação inválido. Verifique a configuração do sistema.';
        } else if (response.status === 400) {
          errorMessage = errorData.errors?.default || 'Dados de autenticação incompletos';
        } else {
          errorMessage = errorData.errors?.default || 'Erro interno ao autenticar';
        }

        authCompletedRef.current = true; // Marca como completado para evitar timeout
        setError(errorMessage);
        setIsLoading(false);

        // Notifica Sistema A do erro com mensagem clara
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'AUTH_ERROR',
            message: errorMessage,
            source: 'IECB'
          }, '*');
        }
        return;
      }

      const data = await response.json();
      console.log('[Auth] Autenticação bem-sucedida:', data.username);

      authCompletedRef.current = true;
      sessionStorage.setItem('iecb_token', data.accessToken);

      const authenticatedUser: IUser = {
        login: data.username,
        nome: data.name,
        empresa: data.companyId,
        grupo: data.groupId,
      };

      setUser(authenticatedUser);
      setError(null);
      setIsLoading(false);
      sessionStorage.setItem('iecb_user', JSON.stringify(authenticatedUser));

      // Notifica Sistema A do sucesso
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'AUTH_SUCCESS', source: 'IECB' }, '*');
      }
    } catch (err) {
      console.error('[Auth] Erro:', err);
      authCompletedRef.current = true; // Marca como completado para evitar timeout
      setError('Erro de conexão');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isInIframe = window.self !== window.top;

    // Se não está em iframe, verifica sessionStorage e para de carregar
    if (!isInIframe) {
      console.log('[Auth] Não está em iframe, verificando sessão local');
      const storedUser = sessionStorage.getItem('iecb_user');
      const storedToken = sessionStorage.getItem('iecb_token');

      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('[Auth] Sessão existente encontrada:', parsedUser.login);
          authCompletedRef.current = true;
          setUser(parsedUser);
        } catch {
          sessionStorage.removeItem('iecb_user');
          sessionStorage.removeItem('iecb_token');
        }
      }
      setIsLoading(false);
      return;
    }

    // Em iframe: SEMPRE escuta postMessage para validar usuário
    console.log('[Auth] Em iframe, aguardando postMessage do Sistema A');

    const handleMessage = async (event: MessageEvent) => {
      // Ignora mensagens que não são de autenticação
      if (!event.data || event.data.type !== 'AUTH_DATA') {
        return;
      }

      // Evita processamento duplicado
      if (authAttemptedRef.current) {
        console.log('[Auth] Autenticação já em andamento, ignorando');
        return;
      }
      authAttemptedRef.current = true;

      const { frameToken, usuario, empresa, grupo } = event.data;
      console.log('[Auth] postMessage recebido:', { usuario, empresa, grupo });

      // FLUXO:
      // 1. Chama validate() para verificar sessão no backend
      // 2. Se autenticado e mesmo usuário → nada a fazer
      // 3. Se autenticado mas usuário diferente → reautenticar com novo usuário
      // 4. Se não autenticado (401) → autenticar (backend valida o frameToken)

      const validationResult = await validate(usuario);

      switch (validationResult.status) {
        case 'authenticated':
          // Mesmo usuário já autenticado no backend - nada a fazer
          console.log('[Auth] Sessão válida para o mesmo usuário, reutilizando');
          authCompletedRef.current = true;

          // Atualiza o estado local com os dados do usuário
          const authenticatedUser: IUser = {
            login: usuario,
            nome: usuario,
            empresa: empresa,
            grupo: validationResult.groupId,
          };
          setUser(authenticatedUser);
          sessionStorage.setItem('iecb_user', JSON.stringify(authenticatedUser));
          setIsLoading(false);

          if (window.parent !== window) {
            window.parent.postMessage({ type: 'AUTH_SUCCESS', source: 'IECB' }, '*');
          }
          break;

        case 'different_user':
          // Usuário diferente no backend - refazer autenticação com novo username e groupId
          console.log('[Auth] Usuário diferente detectado. Backend:', validationResult.currentUsername, '| Recebido:', usuario);
          console.log('[Auth] Reautenticando com novo usuário...');

          // Limpa sessão anterior
          sessionStorage.removeItem('iecb_user');
          sessionStorage.removeItem('iecb_token');
          sessionStorage.removeItem('username');
          sessionStorage.removeItem('groupId');

          // Autentica com o novo usuário (backend vai criar nova sessão com req.user atualizado)
          authenticateViaPostMessage(frameToken, usuario, empresa, grupo);
          break;

        case 'not_authenticated':
          // Erro 401 - não autenticado no backend
          // Tenta autenticar via postMessage (backend valida frameToken com .env)
          // Se frameToken inválido, backend retorna erro 401 com mensagem clara
          console.log('[Auth] Usuário não autenticado no backend, tentando autenticar...');
          authenticateViaPostMessage(frameToken, usuario, empresa, grupo);
          break;

        case 'error':
          // Erro genérico (rede, servidor, etc)
          console.error('[Auth] Erro na validação:', validationResult.message);
          authCompletedRef.current = true;
          setError(validationResult.message);
          setIsLoading(false);

          if (window.parent !== window) {
            window.parent.postMessage({
              type: 'AUTH_ERROR',
              message: validationResult.message,
              source: 'IECB'
            }, '*');
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    // Timeout de 10s para não ficar carregando eternamente
    const timeoutId = setTimeout(() => {
      if (!authCompletedRef.current) {
        console.log('[Auth] Timeout aguardando postMessage');
        setError('Timeout aguardando autenticação do sistema principal');
        setIsLoading(false);
      }
    }, 10000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeoutId);
    };
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
