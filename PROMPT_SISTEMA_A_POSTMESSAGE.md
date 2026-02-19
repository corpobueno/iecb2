# Integração Sistema A (Corpo Bueno) com Sistema B (IECB) via postMessage

## Fluxo Simplificado

O Sistema B (IECB) é carregado em um iframe dentro do Sistema A. A autenticação é feita via `postMessage`.

```
Sistema A                          Sistema B (iframe)
    |                                     |
    |  1. Carrega iframe                  |
    |------------------------------------>|
    |                                     |
    |  2. postMessage AUTH_DATA           |
    |  (frameToken, usuario, empresa,     |
    |   grupo)                            |
    |------------------------------------>|
    |                                     |
    |                           3. Chama backend
    |                              /auth/post-message
    |                                     |
    |  4. postMessage AUTH_SUCCESS        |
    |<------------------------------------|
    |     ou AUTH_ERROR                   |
```

## Implementação no Sistema A

### 1. Componente do Iframe

```tsx
import { useEffect, useRef, useState } from 'react';

const IECB_URL = 'https://app.institutocorpobueno.com.br';
const FRAME_TOKEN = 'SEU_FRAME_TOKEN_COMPARTILHADO'; // Mesmo valor do .env do Sistema B

interface IECBFrameProps {
  usuario: string;    // Login do usuário
  empresa: number;    // ID da empresa
  grupo: number;      // ID do grupo
  path?: string;      // Rota inicial (ex: '/acompanhamento')
}

export const IECBFrame: React.FC<IECBFrameProps> = ({
  usuario,
  empresa,
  grupo,
  path = '/'
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Escuta mensagens do iframe
    const handleMessage = (event: MessageEvent) => {
      // Verifica origem
      if (!event.origin.includes('institutocorpobueno.com.br') &&
          !event.origin.includes('localhost')) {
        return;
      }

      if (event.data?.source !== 'IECB') return;

      switch (event.data.type) {
        case 'AUTH_SUCCESS':
          console.log('[Sistema A] IECB autenticado com sucesso');
          setIsAuthenticated(true);
          setError(null);
          break;

        case 'AUTH_ERROR':
          console.error('[Sistema A] Erro na autenticação IECB:', event.data.message);
          setError(event.data.message);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Envia dados de autenticação quando iframe carrega
  const handleIframeLoad = () => {
    if (!iframeRef.current?.contentWindow) return;

    console.log('[Sistema A] Enviando AUTH_DATA para IECB');

    iframeRef.current.contentWindow.postMessage({
      type: 'AUTH_DATA',
      frameToken: FRAME_TOKEN,
      usuario,
      empresa,
      grupo,
    }, IECB_URL);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {error && (
        <div style={{ color: 'red', padding: '10px' }}>
          Erro: {error}
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={`${IECB_URL}${path}`}
        onLoad={handleIframeLoad}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: isAuthenticated ? 'block' : 'none',
        }}
      />

      {!isAuthenticated && !error && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Carregando...
        </div>
      )}
    </div>
  );
};
```

### 2. Uso do Componente

```tsx
// Em qualquer página do Sistema A
import { IECBFrame } from './components/IECBFrame';

const MinhaPageina = () => {
  const user = useCurrentUser(); // Seu hook de usuário

  return (
    <div style={{ height: '100vh' }}>
      <IECBFrame
        usuario={user.login}
        empresa={user.empresa}
        grupo={user.grupo}
        path="/acompanhamento"
      />
    </div>
  );
};
```

## Configuração

### Sistema B (IECB) - .env

```env
FRAME_TOKEN=seu_token_secreto_compartilhado
```

### Sistema A - Constante

```tsx
const FRAME_TOKEN = 'seu_token_secreto_compartilhado'; // Mesmo valor!
```

## Mensagens postMessage

### Sistema A -> Sistema B

| Tipo | Campos | Descrição |
|------|--------|-----------|
| `AUTH_DATA` | `frameToken`, `usuario`, `empresa`, `grupo` | Dados de autenticação |

### Sistema B -> Sistema A

| Tipo | Campos | Descrição |
|------|--------|-----------|
| `AUTH_SUCCESS` | - | Autenticação OK |
| `AUTH_ERROR` | `message` | Erro na autenticação |

## Segurança

1. O `FRAME_TOKEN` é um segredo compartilhado entre os dois sistemas
2. O backend do Sistema B valida o token antes de criar a sessão
3. O JWT é armazenado no sessionStorage do iframe (isolado do Sistema A)
4. Cada requisição do Sistema B envia o JWT no header `Authorization`
