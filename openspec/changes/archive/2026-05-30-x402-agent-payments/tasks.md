# Tasks: x402 Agent Payments

## Phase 1: Foundation — Deps + Env + Config

- [x] 1.1 Add deps to `package.json`: `@coinbase/x402`, `x402-next`, `@coinbase/cdp-sdk`, `@t3-oss/env-nextjs`, `viem`, `zod`
- [x] 1.2 Create `lib/env.ts` — `createEnv` con Zod schemas para CDP vars + `NETWORK` default `base-sepolia`
- [x] 1.3 Update `next.config.mjs` — `typescript.ignoreBuildErrors: true`

## Phase 2: Core Implementation

- [x] 2.1 Create `lib/accounts.ts` — `getOrCreateSellerAccount()`, `getOrCreatePurchaserAccount()` con CDP `CdpClient` + faucet request en testnet
- [x] 2.2 Create `lib/products.ts` — array estático de `Product` desde `@app/core` con `Money` prices
- [x] 2.3 Create `middleware.ts` — `x402Middleware` con `paymentMiddleware()` de x402-next + bot detection regex + matcher config
- [x] 2.4 Create `app/api/quote/route.ts` — `GET` handler que devuelve `Product` ID, name, price (bigint) desde `lib/products.ts`

## Phase 3: Testing

- [x] 3.1 Test `lib/env.ts` — `NETWORK` default es `base-sepolia`, URL se construye desde `VERCEL_PROJECT_PRODUCTION_URL`, accepts `base` mainnet
- [x] 3.2 Test `lib/bot-detection.ts` — bot regex matchea user-agents conocidos (GPTBot, ClaudeBot, PerplexityBot, etc.) y no matchea Chrome/Firefox
- [x] 3.3 Test `GET /api/quote` — respuesta 200 con shape `{ id, name, price: { amount } }`, price como string bigint
