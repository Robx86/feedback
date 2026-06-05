# Feedback Widget

Botão flutuante + modal de feedback para projetos **React / Next.js** com **shadcn/ui** e **Tailwind CSS v3**, distribuído como um [shadcn registry](https://ui.shadcn.com/docs/registry).

Captura um screenshot da tela automaticamente antes de abrir o modal e envia o feedback (tipo, mensagem, contexto técnico e print) via `POST` para um endpoint configurável.

O componente é **agnóstico de autenticação, toast e monitoramento de erros** — você pluga o que já usa através das props.

## Instalação

```bash
npx shadcn@latest add Robx86/feedback-widget/feedback-widget
```

O CLI instala os arquivos e resolve as dependências automaticamente.

### Dependências

| npm | shadcn/ui (registry) |
| --- | --- |
| `zod`, `react-hook-form`, `@hookform/resolvers`, `html-to-image`, `lucide-react` | `button`, `dialog`, `form`, `select`, `textarea` |

### Arquivos instalados

```
components/feedback/feedback-widget.tsx   # FAB + orquestração do envio
components/feedback/feedback-modal.tsx    # UI do formulário + preview do print
components/feedback/feedback.schema.ts    # Zod schema + tipos do payload
components/feedback/feedback.utils.ts     # contexto do cliente + parsing do print
hooks/use-screenshot.ts                   # captura via html-to-image
```

## Uso

```tsx
import { FeedbackWidget } from "@/components/feedback/feedback-widget";

export default function AppLayout() {
  return (
    <>
      {/* ...sua aplicação... */}

      <FeedbackWidget
        endpoint="https://api.seuapp.com/feedback"
        headers={{ Authorization: `Bearer ${token}` }}
        onSuccess={() => toast.success("Feedback enviado!")}
        onError={(error) => console.error(error)}
      />
    </>
  );
}
```

### Props

| Prop | Tipo | Obrigatório | Descrição |
| --- | --- | :---: | --- |
| `endpoint` | `string` | ✅ | URL que recebe o `POST` com o feedback. |
| `headers` | `Record<string, string>` | — | Headers extras enviados no `POST` (ex.: `Authorization`). |
| `onSuccess` | `() => void` | — | Chamado após envio com sucesso. Use para um toast de sucesso. |
| `onError` | `(error: unknown) => void` | — | Chamado em erro de envio **ou** de captura de tela. Plugue aqui seu monitoramento. |

## Exibir em todas as páginas logadas

O `FeedbackWidget` é uma FAB `position: fixed` — **monte uma única vez** no layout que envolve a área autenticada e ele aparece em todas as rotas logadas, sem precisar repetir em cada página. Coloque-o **depois** do conteúdo para garantir o `z-index` correto.

### Next.js — App Router

Use o layout do grupo de rotas protegidas (ex.: `app/(app)/layout.tsx`). Por usar hooks/estado e `html-to-image`, o widget roda no client — isole-o em um Client Component e mantenha o layout como Server Component:

```tsx
// app/(app)/feedback.tsx
"use client";

import { FeedbackWidget } from "@/components/feedback/feedback-widget";

export function Feedback({ token }: { token: string }) {
  return (
    <FeedbackWidget
      endpoint="https://api.seuapp.com/feedback"
      headers={{ Authorization: `Bearer ${token}` }}
    />
  );
}
```

```tsx
// app/(app)/layout.tsx  (Server Component)
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Feedback } from "./feedback";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      {children}
      <Feedback token={session.accessToken} />
    </>
  );
}
```

Todas as páginas dentro de `app/(app)/` passam a exibir o widget. Páginas públicas (`login`, `signup`) fora desse grupo ficam sem ele.

### Next.js — Pages Router

Monte condicionalmente no `_app.tsx`, exibindo só quando houver sessão:

```tsx
// pages/_app.tsx
import { useSession } from "@/lib/auth";
import { FeedbackWidget } from "@/components/feedback/feedback-widget";

export default function App({ Component, pageProps }) {
  const { session } = useSession();

  return (
    <>
      <Component {...pageProps} />
      {session && (
        <FeedbackWidget
          endpoint="https://api.seuapp.com/feedback"
          headers={{ Authorization: `Bearer ${session.accessToken}` }}
        />
      )}
    </>
  );
}
```

### React Router / SPA

Coloque no layout/elemento das rotas protegidas (uma vez), não em cada página:

```tsx
function ProtectedLayout() {
  const { user, token } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Outlet />
      <FeedbackWidget
        endpoint="https://api.seuapp.com/feedback"
        headers={{ Authorization: `Bearer ${token}` }}
      />
    </>
  );
}
```

> **Monte só uma vez.** Renderizar o `FeedbackWidget` em várias páginas ao mesmo tempo gera FABs sobrepostas. Um único ponto de montagem no layout autenticado cobre todas as rotas logadas.

## Payload enviado

O widget faz `fetch` nativo (`POST`) com `Content-Type: application/json` e o seguinte corpo:

```jsonc
{
  "type": "ELOGIO | SUGESTAO | CRITICA | RECLAMACAO",
  "message": "texto do usuário (máx. 2000 chars)",
  "submittedAt": "2026-06-05T12:34:56.000Z", // ISO 8601 (UTC)
  "context": {
    "pageUrl": "https://...",
    "pageTitle": "...",
    "pathname": "/...",
    "referrer": "...",
    "userAgent": "...",
    "language": "pt-BR",
    "timezone": "America/Sao_Paulo",
    "viewport": { "width": 1280, "height": 720 },
    "screen": { "width": 1920, "height": 1080 },
    "devicePixelRatio": 2
  },
  "screenshot": {
    "dataUrl": "data:image/jpeg;base64,...", // print completo
    "mimeType": "image/jpeg",
    "base64": "..."                           // base64 puro, sem o prefixo
  }
}
```

> `screenshot` é `null` quando a captura falha — o feedback nunca é bloqueado por causa do print.

O contrato de tipos (`FeedbackPayload`, `FeedbackClientContext`, `FeedbackScreenshot`) está exportado em `feedback.schema.ts` para reuso no backend/handler.

## Captura de tela

O hook `use-screenshot` usa [`html-to-image`](https://github.com/bubkoo/html-to-image) (importado dinamicamente para não pesar no bundle inicial) e captura o `document.body` antes de abrir o modal.

Para **excluir** um elemento do print, adicione o atributo `data-feedback-exclude`:

```tsx
<div data-feedback-exclude>Não aparece no screenshot</div>
```

A própria FAB de feedback e os toasts (`.Toastify`) já são excluídos por padrão.

## Requisitos

- React 18+ / Next.js
- Tailwind CSS **v3**
- shadcn/ui configurado (`components.json` com os aliases `@/components`, `@/lib`, `@/hooks`)

## Licença

MIT
