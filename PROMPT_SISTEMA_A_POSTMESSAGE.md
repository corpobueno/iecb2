# Implementação de postMessage no Sistema A (Corpo Bueno)

## Contexto

O Sistema B (IECB) agora usa um fluxo de autenticação via iframe oculto e postMessage. O Sistema A precisa:
1. Escutar mensagens postMessage do IECB
2. Reagir a eventos de autenticação (sucesso, erro, re-auth necessário)

## Mensagens que o Sistema B envia

| Tipo | Quando | Dados |
|------|--------|-------|
| `AUTH_SUCCESS` | Autenticação bem-sucedida | `{ type: 'AUTH_SUCCESS', source: 'IECB_AUTH' }` |
| `AUTH_ERROR` | Erro na autenticação | `{ type: 'AUTH_ERROR', message: 'descrição', source: 'IECB_AUTH' }` |
| `AUTH_REQUIRED` | Sessão expirada ou usuário diferente | `{ type: 'AUTH_REQUIRED', message: 'descrição', expectedLogin: 'usuario', source: 'IECB_AUTH' }` |

## Implementação Recomendada

### 1. Hook para escutar mensagens do IECB

```typescript
// hooks/useIECBMessages.ts
import { useEffect, useCallback } from 'react';

interface IECBMessage {
  type: 'AUTH_SUCCESS' | 'AUTH_ERROR' | 'AUTH_REQUIRED';
  message?: string;
  expectedLogin?: string;
  source?: string;
}

interface UseIECBMessagesProps {
  onAuthSuccess: () => void;
  onAuthError: (message: string) => void;
  onAuthRequired: (expectedLogin?: string) => void;
}

export const useIECBMessages = ({
  onAuthSuccess,
  onAuthError,
  onAuthRequired,
}: UseIECBMessagesProps) => {

  const handleMessage = useCallback((event: MessageEvent<IECBMessage>) => {
    // Ignora mensagens que não são do IECB
    if (event.data?.source !== 'IECB_AUTH') return;

    console.log('[useIECBMessages] Mensagem recebida:', event.data);

    switch (event.data.type) {
      case 'AUTH_SUCCESS':
        onAuthSuccess();
        break;
      case 'AUTH_ERROR':
        onAuthError(event.data.message || 'Erro desconhecido');
        break;
      case 'AUTH_REQUIRED':
        onAuthRequired(event.data.expectedLogin);
        break;
    }
  }, [onAuthSuccess, onAuthError, onAuthRequired]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);
};
```

### 2. Componente Frame.tsx Atualizado

```tsx
// components/IECBFrame.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useIECBMessages } from '../hooks/useIECBMessages';

interface IECBFrameProps {
  user: { login: string; empresa: number; unidade: number; grupo: number };
}

type AuthState = 'idle' | 'authenticating' | 'authenticated' | 'error';

const IECB_BACKEND_URL = process.env.IECB_BACKEND_URL || 'https://backend.institutocorpobueno.com.br';
const IECB_FRONTEND_URL = process.env.IECB_FRONTEND_URL || 'https://app.institutocorpobueno.com.br';
const FRAME_TOKEN = process.env.FRAME_TOKEN;

export const IECBFrame = ({ user }: IECBFrameProps) => {
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [error, setError] = useState<string | null>(null);
  const hiddenIframeRef = useRef<HTMLIFrameElement | null>(null);
  const currentTokenRef = useRef<string | null>(null);

  // Função para iniciar autenticação
  const startAuth = useCallback(async () => {
    setAuthState('authenticating');
    setError(null);

    try {
      // 1. Gera token único
      const embedToken = crypto.randomUUID();
      currentTokenRef.current = embedToken;

      // 2. Registra token no backend do IECB
      const response = await fetch(`${IECB_BACKEND_URL}/auth/register-embed-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embedToken,
          login: user.login,
          redirectUrl: window.location.href, // Não usado no fluxo iframe oculto
          frameToken: FRAME_TOKEN,
          empresa: user.empresa,
          unidade: user.unidade,
          grupo: user.grupo,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao registrar token');
      }

      // 3. Cria iframe oculto para autenticação
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `${IECB_FRONTEND_URL}/auth/init?token=${embedToken}`;
      document.body.appendChild(iframe);
      hiddenIframeRef.current = iframe;

      // 4. Timeout de segurança (10 segundos)
      setTimeout(() => {
        if (authState === 'authenticating') {
          setError('Timeout na autenticação');
          setAuthState('error');
          removeHiddenIframe();
        }
      }, 10000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setAuthState('error');
    }
  }, [user, authState]);

  // Remove iframe oculto
  const removeHiddenIframe = useCallback(() => {
    if (hiddenIframeRef.current) {
      hiddenIframeRef.current.remove();
      hiddenIframeRef.current = null;
    }
  }, []);

  // Handlers para mensagens do IECB
  useIECBMessages({
    onAuthSuccess: () => {
      console.log('[IECBFrame] Autenticação bem-sucedida');
      removeHiddenIframe();
      setAuthState('authenticated');
    },
    onAuthError: (message) => {
      console.log('[IECBFrame] Erro na autenticação:', message);
      removeHiddenIframe();
      setError(message);
      setAuthState('error');
    },
    onAuthRequired: (expectedLogin) => {
      console.log('[IECBFrame] Re-autenticação necessária para:', expectedLogin);
      // Reinicia o fluxo de autenticação
      startAuth();
    },
  });

  // Inicia autenticação ao montar
  useEffect(() => {
    startAuth();
    return () => removeHiddenIframe();
  }, []);

  // Re-autentica se o usuário mudar
  useEffect(() => {
    if (authState === 'authenticated') {
      startAuth();
    }
  }, [user.login]);

  if (authState === 'authenticating') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p>Autenticando módulo IECB...</p>
      </div>
    );
  }

  if (authState === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p style={{ color: 'red' }}>Erro: {error}</p>
        <button onClick={startAuth}>Tentar novamente</button>
      </div>
    );
  }

  if (authState === 'authenticated') {
    return (
      <iframe
        src={`${IECB_FRONTEND_URL}?login=${user.login}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="IECB"
      />
    );
  }

  return null;
};
```

### 3. Página que usa o componente

```tsx
// pages/ExternalModule/IECB.tsx
import { IECBFrame } from '../../components/IECBFrame';
import { useAuth } from '../../contexts/AuthContext';

export const IECBPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <p>Usuário não autenticado</p>;
  }

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <IECBFrame
        user={{
          login: user.login,
          empresa: user.empresa,
          unidade: user.unidade,
          grupo: user.grupo,
        }}
      />
    </div>
  );
};
```

## Fluxo Completo

```
Sistema A                              Sistema B (IECB)
─────────                              ─────────

1. Usuario abre módulo IECB
   │
   ▼
2. IECBFrame.startAuth()
   │
   ├─▶ POST /auth/register-embed-token ──▶ Salva token no cache
   │
   ▼
3. Cria iframe oculto
   src=/auth/init?token=xxx ─────────────▶ 4. Frontend IECB carrega
                                              │
                                              ▼
                                           5. POST /auth/validate-embed-token
                                              │
                                              ▼
                                           6. Valida token, seta cookie
                                              │
                                              ▼
7. ◀──────────────────────────────────────── postMessage('AUTH_SUCCESS')
   │
   ▼
8. Remove iframe oculto
   Carrega iframe principal ─────────────▶ 9. IECB carrega autenticado ✓
   src=/?login=usuario

--- Se usuário mudar ou sessão expirar ---

10. IECB detecta mismatch
    │
    ▼
11. ◀─────────────────────────────────────── postMessage('AUTH_REQUIRED')
    │
    ▼
12. IECBFrame.startAuth() (reinicia fluxo)
```

## Variáveis de Ambiente

```env
IECB_BACKEND_URL=https://backend.institutocorpobueno.com.br
IECB_FRONTEND_URL=https://app.institutocorpobueno.com.br
FRAME_TOKEN=9y8R6m1KZpYwFQ3WnB2tXJ4dC0uE5sLhA7qVfN8rTgM
```

## Pontos Importantes

1. **Sempre passe `?login=usuario`** na URL do iframe principal para que o IECB saiba qual usuário esperar

2. **O iframe oculto é temporário** - só existe durante a autenticação e é removido após `AUTH_SUCCESS` ou `AUTH_ERROR`

3. **Re-autenticação automática** - quando o IECB envia `AUTH_REQUIRED`, o Sistema A deve reiniciar o fluxo de autenticação

4. **Timeout de segurança** - se não receber resposta em 10 segundos, considera erro

5. **Troca de usuário** - se o usuário logado no Sistema A mudar, o componente deve reiniciar a autenticação

## Testando

1. Abra o módulo IECB no Sistema A
2. Deve ver "Autenticando..." brevemente
3. Depois o iframe principal carrega
4. Navegue pelo IECB - deve funcionar sem erros de sessão
5. Troque de usuário no Sistema A e reabra o IECB - deve re-autenticar automaticamente
