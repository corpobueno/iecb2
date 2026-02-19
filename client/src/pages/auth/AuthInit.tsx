import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Environment } from '../../api/axios-config/environment';

type AuthStatus = 'loading' | 'success' | 'error';

/**
 * Página de inicialização de autenticação via embed (iframe oculto)
 * Valida o token, seta cookie e envia postMessage para o parent
 */
export const AuthInit = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const authAttemptedRef = useRef(false); // Evita dupla execução (React StrictMode)

  const token = searchParams.get('token');

  // Função para enviar mensagem ao parent (Sistema A)
  const sendMessageToParent = (type: 'AUTH_SUCCESS' | 'AUTH_ERROR', message?: string) => {
    if (window.parent !== window) {
      window.parent.postMessage({
        type,
        message,
        source: 'IECB_AUTH'
      }, '*');
      console.log('[AuthInit] postMessage enviado:', type, message || '');
    } else {
      console.log('[AuthInit] Não está em iframe, ignorando postMessage');
    }
  };

  useEffect(() => {
    // Evita dupla execução (React StrictMode em desenvolvimento)
    if (authAttemptedRef.current) {
      console.log('[AuthInit] Autenticação já foi tentada, ignorando');
      return;
    }
    authAttemptedRef.current = true;

    const initAuth = async () => {
      console.log('[AuthInit] Iniciando autenticação');
      console.log('[AuthInit] Token:', token?.substring(0, 8) + '...');
      console.log('[AuthInit] Backend URL:', Environment.URL_BASE);

      if (!token) {
        setErrorMessage('Token não fornecido');
        setStatus('error');
        sendMessageToParent('AUTH_ERROR', 'Token não fornecido');
        return;
      }

      try {
        const url = `${Environment.URL_BASE}/auth/validate-embed-token`;
        console.log('[AuthInit] Chamando:', url);

        // Chama backend para validar token e setar cookie
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Importante para receber o cookie
          body: JSON.stringify({ token }),
        });

        console.log('[AuthInit] Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.log('[AuthInit] Error data:', errorData);
          const msg = errorData.errors?.default || 'Token inválido ou expirado';
          setErrorMessage(msg);
          setStatus('error');
          sendMessageToParent('AUTH_ERROR', msg);
          return;
        }

        // IMPORTANTE: Enviar AUTH_SUCCESS IMEDIATAMENTE após status 200
        // Isso garante que a mensagem seja enviada mesmo se o iframe for removido
        // pelo cleanup() do Sistema A antes de conseguirmos ler o body
        console.log('[AuthInit] Status 200 recebido, enviando AUTH_SUCCESS imediatamente');
        setStatus('success');
        sendMessageToParent('AUTH_SUCCESS');

        // Tentar ler o body apenas para log (não é crítico)
        try {
          const data = await response.json();
          console.log('[AuthInit] Response body:', data);
        } catch (bodyError) {
          // Ignorar erro ao ler body - o cookie já foi setado e AUTH_SUCCESS já foi enviado
          console.log('[AuthInit] Não foi possível ler body (iframe pode ter sido removido), mas autenticação OK');
        }

      } catch (error) {
        console.error('[AuthInit] Erro na autenticação:', error);
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        const msg = `Erro de conexão: ${errorMsg}`;
        setErrorMessage(msg);
        setStatus('error');
        sendMessageToParent('AUTH_ERROR', msg);
      }
    };

    initAuth();
  }, [token]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      {status === 'loading' && (
        <>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
          <p style={{ color: '#666' }}>Autenticando...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
          <p style={{ color: '#4caf50', fontWeight: 'bold' }}>Autenticado com sucesso</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✗</div>
          <p style={{ color: '#f44336', fontWeight: 'bold' }}>Erro na autenticação</p>
          <p style={{ color: '#666' }}>{errorMessage}</p>
        </>
      )}
    </div>
  );
};

export default AuthInit;
