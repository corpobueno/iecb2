# Instruções para Implementação no Sistema A (Corpo Bueno)

## Contexto

O Sistema A (Corpo Bueno) precisa abrir o Sistema B (IECB) dentro de um iframe de forma autenticada.
Devido a restrições de cookies de terceiros em navegadores modernos, implementamos um fluxo seguro de autenticação server-to-server.

## Fluxo de Autenticação

```
1. Usuário clica para abrir o módulo IECB no Sistema A
2. Backend A gera token efêmero único
3. Backend A registra o token no Backend B (server-to-server)
4. Frontend A redireciona navegador para Backend B: /auth/init?token=xxx
5. Backend B valida token, seta cookie no navegador, redireciona de volta
6. Frontend A renderiza o iframe do IECB (cookie já existe!)
```

## O que já está implementado no Sistema B (IECB)

### Endpoint 1: Registrar Token (server-to-server)
```
POST https://backend.institutocorpobueno.com.br/auth/register-embed-token
Content-Type: application/json

{
  "embedToken": "uuid-gerado-pelo-sistema-a",
  "login": "usuario.logado",
  "redirectUrl": "https://app.corpobueno.com.br/callback-iecb",
  "frameToken": "9y8R6m1KZpYwFQ3WnB2tXJ4dC0uE5sLhA7qVfN8rTgM"
}

Resposta: { "success": true, "message": "Token registrado com sucesso" }
```

### Endpoint 2: Inicializar Sessão (navegador acessa)
```
GET https://app.institutocorpobueno.com.br/auth/init?token=uuid-gerado
- Valida e consome o token
- Seta cookie httpOnly no navegador
- Redireciona para redirectUrl
```

## O que precisa ser implementado no Sistema A

### 1. Adicionar variável de ambiente
```env
FRAME_TOKEN=9y8R6m1KZpYwFQ3WnB2tXJ4dC0uE5sLhA7qVfN8rTgM
IECB_BACKEND_URL=https://backend.institutocorpobueno.com.br
IECB_FRONTEND_URL=https://app.institutocorpobueno.com.br
```

### 2. Criar endpoint no Backend A para preparar sessão embed

**Arquivo sugerido:** `src/controllers/IECBController.ts` ou adicionar ao controller existente

```typescript
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

const IECB_BACKEND_URL = process.env.IECB_BACKEND_URL || 'https://backend.institutocorpobueno.com.br';
const IECB_FRONTEND_URL = process.env.IECB_FRONTEND_URL || 'https://app.institutocorpobueno.com.br';
const FRAME_TOKEN = process.env.FRAME_TOKEN;

export class IECBController {
  /**
   * Prepara sessão para abrir IECB em embed
   * Retorna URL para redirecionar o navegador
   */
  async prepareEmbedSession(req: Request, res: Response) {
    try {
      // Obtém o usuário logado (adaptar conforme seu sistema de auth)
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Gera token efêmero único
      const embedToken = randomUUID();

      // URL de callback após autenticação no IECB
      const callbackUrl = `${process.env.APP_URL}/iecb/callback`;

      // Registra o token no Backend B (server-to-server)
      const response = await fetch(`${IECB_BACKEND_URL}/auth/register-embed-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embedToken,
          login: user.login || user.username,
          redirectUrl: callbackUrl,
          frameToken: FRAME_TOKEN,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return res.status(500).json({
          error: 'Falha ao preparar sessão IECB',
          details: error
        });
      }

      // Retorna a URL para o frontend redirecionar o navegador
      const initUrl = `${IECB_FRONTEND_URL}/auth/init?token=${embedToken}`;

      return res.json({
        success: true,
        redirectUrl: initUrl,
      });
    } catch (error) {
      console.error('Erro ao preparar sessão IECB:', error);
      return res.status(500).json({ error: 'Erro interno' });
    }
  }
}
```

### 3. Adicionar rota no Backend A

```typescript
// No arquivo de rotas
router.post('/iecb/prepare-session', ensureAuthenticated, (req, res) => iecbController.prepareEmbedSession(req, res));
```

### 4. Criar página de callback no Frontend A

**Arquivo sugerido:** `src/pages/IECBCallback.tsx` (ou equivalente)

```tsx
import { useEffect, useState } from 'react';

export const IECBCallback = () => {
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    // Quando esta página carrega, o cookie do IECB já foi setado
    // Agora podemos mostrar o iframe
    setShowIframe(true);
  }, []);

  if (!showIframe) {
    return <div>Carregando módulo IECB...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src="https://app.institutocorpobueno.com.br"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="IECB"
      />
    </div>
  );
};
```

### 5. Criar botão/link para abrir IECB

```tsx
import { useState } from 'react';

export const OpenIECBButton = () => {
  const [loading, setLoading] = useState(false);

  const handleOpenIECB = async () => {
    setLoading(true);
    try {
      // Chama o backend para preparar a sessão
      const response = await fetch('/api/iecb/prepare-session', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Falha ao preparar sessão');
      }

      const data = await response.json();

      // Redireciona o navegador para o IECB (isso seta o cookie)
      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao abrir módulo IECB');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleOpenIECB} disabled={loading}>
      {loading ? 'Carregando...' : 'Abrir IECB'}
    </button>
  );
};
```

## Fluxo Completo

1. Usuário clica no botão "Abrir IECB"
2. Frontend A chama `POST /api/iecb/prepare-session`
3. Backend A:
   - Gera UUID para embedToken
   - Chama Backend B: `POST /auth/register-embed-token`
   - Retorna `redirectUrl` para o Frontend A
4. Frontend A redireciona: `window.location.href = redirectUrl`
5. Navegador acessa: `https://app.institutocorpobueno.com.br/auth/init?token=xxx`
6. Backend B:
   - Valida o token (existe, não expirado, uso único)
   - Seta cookie `accessToken` no navegador
   - Redireciona para `https://app.corpobueno.com.br/iecb/callback`
7. Frontend A (página callback):
   - Renderiza o iframe do IECB
   - O iframe abre autenticado (cookie já existe!)

## Segurança

- **FRAME_TOKEN**: Chave compartilhada entre os dois backends (nunca exposta no frontend)
- **embedToken**: Token efêmero, expira em 60 segundos, uso único
- **Validação server-to-server**: Nenhum segredo é exposto ao navegador
- **Cookie httpOnly**: Não acessível via JavaScript

## URLs de Produção

- Backend IECB: `https://backend.institutocorpobueno.com.br`
- Frontend IECB: `https://app.institutocorpobueno.com.br`
- FRAME_TOKEN: `9y8R6m1KZpYwFQ3WnB2tXJ4dC0uE5sLhA7qVfN8rTgM`

## Testando

1. Implemente os endpoints no Sistema A
2. Adicione as variáveis de ambiente
3. Acesse o Sistema A logado
4. Clique no botão para abrir IECB
5. Deve redirecionar → setar cookie → voltar → mostrar iframe autenticado
