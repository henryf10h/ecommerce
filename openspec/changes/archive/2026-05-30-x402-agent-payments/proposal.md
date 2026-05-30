# Proposal: x402 Agent Payments

## Intent

Port `x402-ai-starter` (Vercel Labs) into `@app/agent-api` — el agente que acepta pagos USDC via HTTP 402 (x402 protocol) en Base. Convierte `@app/agent-api` de scaffold placeholder a un endpoint de pagos que agents (AI, bots, otros servicios) pueden consumir.

## Scope

### In Scope
- **x402 middleware**: `paymentMiddleware` de `x402-next` + `@coinbase/x402` facilitator para interceptar requests y requerir pago
- **CDP wallet**: Server wallets via `@coinbase/cdp-sdk` (Purchaser + Seller accounts) para manejar fondos
- **Env validation**: `@t3-oss/env-nextjs` con Zod schemas para `CDP_API_KEY_ID`, `CDP_API_KEY_SECRET`, `CDP_WALLET_SECRET`, `NETWORK`
- **Demo paywalled endpoint**: `GET /api/quote` que devuelve quote de producto — protegido por x402
- **Domain integration**: Usar `@app/core` types (Product, Money, Order, Payment) en los endpoints
- **Robots/Bot detection**: Middleware detecta scrapers/bots y les aplica x402, humanos pasan libre
- **Deps**: `@coinbase/x402`, `x402-next`, `@coinbase/cdp-sdk`, `viem`, `@t3-oss/env-nextjs`, `zod`
- **Next config**: `next.config.mjs` con `typescript.ignoreBuildErrors` (como el template, para builds sin env vars)

### Out of Scope
- AI Chat UI, AI SDK, AI Elements, shadcn components (reservado para futuro)
- MCP server integration (future change)
- Blog pages, Playground, página principal con chat
- Tailwind CSS (agent-api no tiene UI, son endpoints)
- Base de datos — productos estáticos (como el template)
- Tests de integración con CDP real (requiere API keys)

## Capabilities

### New Capabilities
- `x402-payments`: Middleware x402 + CDP wallet + paywalled API endpoints

### Modified Capabilities
- (none — `@app/agent-api` replacement total del scaffold)

## Approach

Port focalizado del template `vercel-labs/x402-ai-starter`. En lugar de copiar todo el stack (AI SDK, chat UI, MCP, Tailwind v4), nos llevamos solo el core: middleware x402, wallet management, env validation, y un endpoint demo. El template usa Next.js 15 + React 19 + Tailwind v4 — nosotros adaptamos a Next.js 14 + React 18 (sin Tailwind, no hace falta para API routes).

Tampoco hay que olvidar que `@app/core` ya tiene `Money`, `Product`, `Order`, `Payment` — los endpoints de x402 pueden usar esos tipos para comunicar montos y estados de pago.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/agent-api/` | Modified | De scaffold a agente de pagos x402 |
| `packages/agent-api/package.json` | Modified | Nuevas deps: x402, cdp-sdk, viem, t3-env, zod |
| `packages/agent-api/app/` | Modified | Layout + page reemplazados, + api routes |
| `packages/agent-api/lib/` | New | Env, accounts, config |
| `packages/agent-api/middleware.ts` | New | x402 payment middleware |
| `packages/agent-api/next.config.mjs` | Modified | Config con env validation + ignoreBuildErrors |
| `openspec/specs/x402-payments/` | New | Specs del nuevo capability |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| x402 + CDP SDK require Node 18+ | Low | Monorepo usa Node >=20 |
| @coinbase/cdp-sdk puede tener peer-deps conflicts | Med | Pin a versión estable, testear build |
| x402-next requiere Next.js 14+ | Low | Tenemos Next.js 14.2 |
| Sin CDP API keys no se puede testear build completo | Med | `ignoreBuildErrors` en next.config como el template |

## Rollback Plan

`git revert` del commit. `@app/agent-api` vuelve al scaffold placeholder. `package.json` vuelve a deps originales.

## Dependencies

- `@app/core` (change #2) — tipos de dominio: Product, Money, Order, Payment
- `@coinbase/x402` ^0.5.x
- `x402-next` ^0.6.x
- `@coinbase/cdp-sdk` ^1.36.x
- `viem` ^2.x (ya en monorepo via @app/web)
- `@t3-oss/env-nextjs` ^0.13.x
- `zod` ^3.x

## Success Criteria

- [ ] `pnpm --filter @app/agent-api test` pasa
- [ ] `pnpm --filter @app/agent-api build` pasa (Next build exit 0)
- [ ] `pnpm lint` pasa — zero boundary violations
- [ ] `GET /api/quote` responde con quote cuando NO hay x402 header
- [ ] Middleware x402 está configurado para `/api/*` routes
- [ ] CDP wallet accounts se crean (Purchaser + Seller)
- [ ] `VERSION` de `@app/core` se importa y muestra en página placeholder
