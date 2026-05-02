# Pralvex — legal-tech operating system

> Plataforma jurídica brasileira em produção. Stack Next.js 14 + Supabase + Stripe + Anthropic. Vanix Corp portfolio.

[pralvex.com.br](https://pralvex.com.br) — produção
[github.com/Russoz01/lexai-dashboard](https://github.com/Russoz01/lexai-dashboard) — repo

---

## Stack

- **Framework**: Next.js 14.2 (App Router) + TypeScript strict + Tailwind 3.4
- **Auth/DB**: Supabase (Postgres 17 + RLS + RPC SECURITY DEFINER)
- **AI**: Anthropic SDK (Sonnet 4 + Haiku 4) com prompt caching
- **Payments**: Stripe (subscriptions + customer portal + webhooks)
- **Email**: Resend
- **Observability**: Sentry + Microsoft Clarity
- **Hosting**: Vercel (region gru1)
- **Type/Animation**: DM Sans + Playfair Display + Framer Motion 12

---

## Quick start (dev local)

```bash
# 1. Clone + install
git clone https://github.com/Russoz01/lexai-dashboard.git
cd lexai-dashboard
npm install

# 2. Setup env
cp .env.example .env.local
# Preenche os valores (ver tabela abaixo)

# 3. Generate OAUTH_ENCRYPTION_KEY (obrigatorio)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Cole o output em OAUTH_ENCRYPTION_KEY no .env.local

# 4. Generate CRON_SECRET
openssl rand -hex 32
# Cole em CRON_SECRET

# 5. Run dev
npm run dev
# Abre http://localhost:3000
```

---

## Environment variables

### Required (app não sobe sem)

| Var | Source | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard | URL do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard | anon key (cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard | server-only, nunca expor |
| `NEXT_PUBLIC_SITE_URL` | manual | `http://localhost:3000` em dev |
| `ANTHROPIC_API_KEY` | Anthropic console | sk-ant-api03-... |
| `OAUTH_ENCRYPTION_KEY` | gerada local | AES-256-GCM, 32+ bytes base64 (SEC-04) |

### Required em prod

| Var | Source | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe dashboard | sk_live_... em prod |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard webhooks | whsec_... |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard | pk_live_... |
| `STRIPE_PRICE_ID_SOLO` | Stripe products | price_... R$599 |
| `STRIPE_PRICE_ID_ESCRITORIO` | Stripe products | price_... R$1399 |
| `STRIPE_PRICE_ID_FIRMA` | Stripe products | price_... R$1599 |
| `CRON_SECRET` | gerada local | autentica jobs em /api/cron/* |

### Recommended

| Var | Source | Sem isso... |
|---|---|---|
| `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` | Sentry | erros não rastreáveis |
| `SENTRY_AUTH_TOKEN` | Sentry account API | source maps não fazem upload |
| `RESEND_API_KEY` | Resend dashboard | emails de welcome/trial não enviam |
| `RESEND_FROM_EMAIL` | manual | default fallback @resend.dev |

### Optional (features ficam off)

| Var | Feature | Fallback se ausente |
|---|---|---|
| `GOOGLE_CLIENT_ID` + `_SECRET` + `_REDIRECT_URI` | Google Calendar (agente Rotina) | Rotina funciona sem sync |
| `JUSBRASIL_API_KEY` | Pesquisador jurisprudência real | usa Claude hallucination + grounding |
| `BELVO_SECRET_ID` + `_PASSWORD` + `_URL` | Open Banking import financeiro | manual entry only |
| `DEMO_FALLBACK_ENABLED=1` | Cached responses em demos | Anthropic 5xx quebra UI |

---

## Scripts

```bash
npm run dev         # dev server (port 3000)
npm run build       # production build (compila + lint + tipo-check)
npm run start       # production server
npm run lint        # ESLint (no-console: error ativa, fail em regression)
npm test            # vitest unit tests
npm run test:e2e    # Playwright local (PLAYWRIGHT_BASE_URL=http://localhost:3000)
npm run test:e2e:prod  # Playwright contra produção
```

---

## Architecture (high-level)

```
src/
├─ app/
│  ├─ api/            27+ routes (agentes IA + auth + stripe + admin)
│  ├─ dashboard/      27+ páginas de agentes (chat, redator, resumidor, etc)
│  ├─ (landing)       /, /empresas, /sobre, /privacidade, /termos
│  ├─ login/          auth (email + Google OAuth)
│  └─ oc-advogados/   site cliente separado (não tema)
├─ components/        UI compartilhada
├─ context/           ThemeContext (dark/light/system)
├─ lib/
│  ├─ safe-log.ts         PII scrub wrapper (SEC-05)
│  ├─ sentry-scrub.ts     PII scrub Sentry events
│  ├─ crypto-tokens.ts    AES-256-GCM OAuth tokens (SEC-04)
│  ├─ oab-validator.ts    Provimento 205/2021 enforcement
│  ├─ plan-access.ts      gate por plano (4 tiers)
│  ├─ rate-limit.ts       20 req/min per user
│  ├─ quotas.ts           daily quotas per plan
│  ├─ audit.ts            LGPD Art. 37 audit log
│  ├─ with-agent-auth.ts  wrapper canônico das routes
│  └─ ...
└─ middleware.ts      CSP nonce + auth refresh + redirects
```

### Plan tiers

| Plan | R$ | Agents | Quota/dia |
|---|---|---|---|
| Free | 0 | 0 | 5 |
| Solo | 599 | 8 essenciais | 50 |
| Escritório | 1399 | 18 (Solo + intermediários) | 200 |
| Firma | 1599 | 27 (todos) | ilimitado |
| Enterprise | custom | 27 + custom | ilimitado |

Source of truth: `src/lib/plan-access.ts`.

---

## Security baseline

Hardening aplicado (Wave R1, 2026-05-02):

- **SEC-01**: CSP com nonce em middleware, allowlist explícita
- **SEC-02**: CSRF state via timingSafeEqual (Google OAuth)
- **SEC-03**: Stripe `charge.refunded` handler + revoga acesso
- **SEC-04**: OAuth tokens encrypted AES-256-GCM (LGPD Art. 46)
- **SEC-05**: 88 ocorrências de console.* refactoradas pra safeLog (PII scrub)
- **Sentry**: beforeSend + beforeBreadcrumb com scrub recursivo
- **ESLint**: `no-console: error` (CI fail em regressão)
- **Audit log**: user.delete, plan_change, oauth_connect, document.share

Cobertura verificada via `npm run test:e2e -- smoke.spec.ts plan-gating.spec.ts`.

---

## Health monitoring

`GET /api/health` retorna 200 (healthy) ou 503 (degraded). Checks:

- `app` — implícito (server respondendo)
- `env` — required env vars presentes
- `supabase` — round-trip query
- `anthropic` — env var presente
- `stripe` + `stripe_webhook` — env vars presentes
- `crypto` — `OAUTH_ENCRYPTION_KEY` >=16 chars
- `sentry` — DSN configured (warning-only, não 503)

Recomendação: BetterStack/Pingdom monitor a cada 60s.

---

## Theme system

Light + Dark + System preference. CSS variables em `src/app/globals.css`. Toggle 3-state em `src/components/ThemeToggle.tsx`. Default = dark (preserva editorial brand).

Boot script no `<head>` aplica tema antes de hydration → zero flash.

---

## Deploy

Vercel:
- Push to `main` → auto-deploy production
- Push to feature branch → preview deploy
- Env vars: setadas via dashboard (todas as REQUIRED + RECOMMENDED em prod)
- Sentry source maps: upload automático via `SENTRY_AUTH_TOKEN`
- Cron jobs: `vercel.json` define schedules pra `/api/cron/*`

---

## Operator

Leonardo (Vanix Corp). PT-BR informal direto, no emoji, no corporate filler.

---

## License

Proprietary. Vanix Corp 2026.
