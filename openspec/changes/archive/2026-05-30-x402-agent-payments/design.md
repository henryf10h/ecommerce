# Design: x402 Agent Payments

## Technical Approach

Port the core x402 infrastructure from `vercel-labs/x402-ai-starter` into `@app/agent-api`: env validation (`@t3-oss/env-nextjs`), CDP server wallet management (Purchaser + Seller), x402 payment middleware (`x402-next` + `@coinbase/x402`), and a demo paywalled endpoint (`GET /api/quote`). No UI, no AI SDK, no database — solo el protocolo de pagos HTTP 402.

`@app/core` ya tiene `Product` y `Money` — los endpoints los usan para responder con tipos de dominio.

## Architecture Decisions

### Decision: Bot detection via user-agent regex

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Regex inline en middleware | Mantiene todo en un archivo, simple | ✅ Elegido |
| External service (CrawlerDetect) | Más preciso pero agrega latencia + dep | ❌ Descartado |

**Rationale**: El template ya tiene un regex probado. No necesitamos precisión de servicio externo para un MVP.

### Decision: `GET /api/quote` devuelve JSON plano, no `NextResponse.json`

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `NextResponse.json()` | Wrapper de Next, más verboso | ❌ Descartado |
| `Response.json()` | Zero dependency, funciona igual | ✅ Elegido |

**Rationale**: El health check ya usa `Response.json()`. Consistencia > features de Next que no usamos.

### Decision: Static product list inline en vez de DB

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Static array en `lib/products.ts` | Simple, sin infraestructura | ✅ Elegido |
| DB (Drizzle + Postgres) | Ya está en el plan pero no para este change | ❌ Descartado |

**Rationale**: Coincide con el template (productos estáticos) y con el scope del proposal.

### Decision: No tests de integración para CDP wallet

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Mock CDP SDK en tests | Da confianza pero es frágil (mockea SDK externo) | ❌ Descartado |
| Sin tests de integración | Aceptamos riesgo, validamos en deploy real | ✅ Elegido |

**Rationale**: CDP SDK requiere API keys reales. Mockearlo da falsa confianza. Los tests de unidad cubren la lógica del endpoint.

## Data Flow

```
HTTP Request
    │
    ▼
middleware.ts ──── check user-agent ────→ bot? ──yes──→ x402Middleware()
    │                                                  │
    │                                                  ▼
    │                                          HTTP 402 + challenge headers
    │                                                  │
    │                                          (client pays → retries)
    │                                                  │
    │                                                  ▼
    └── no bot ──────────────────────→ NextResponse.next()
                                               │
                                               ▼
                                        GET /api/quote
                                               │
                                               ▼
                                        lib/products.ts ──→ Product from @app/core
                                               │
                                               ▼
                                        Response.json({ id, name, price })
```

## File Changes

| File | Action | Description |
|------|--------|------------|
| `packages/agent-api/package.json` | Modify | Add deps: `@coinbase/x402`, `x402-next`, `@coinbase/cdp-sdk`, `@t3-oss/env-nextjs`, `viem`, `zod` |
| `packages/agent-api/next.config.mjs` | Modify | Add `typescript.ignoreBuildErrors: true`, env validation call |
| `packages/agent-api/middleware.ts` | Create | x402 payment middleware with bot detection from template |
| `packages/agent-api/lib/env.ts` | Create | `@t3-oss/env-nextjs` schema for CDP vars + NETWORK |
| `packages/agent-api/lib/accounts.ts` | Create | `getOrCreateSellerAccount()` + `getOrCreatePurchaserAccount()` |
| `packages/agent-api/lib/products.ts` | Create | Static product list using `Product` from `@app/core` |
| `packages/agent-api/app/api/quote/route.ts` | Create | Paywalled endpoint returning product quote |
| `packages/agent-api/app/api/quote/route.test.ts` | Create | Unit test for quote endpoint |
| `packages/agent-api/app/page.tsx` | Keep (no change) | Already imports `VERSION` from `@app/core` — compliant |
| `packages/agent-api/app/layout.tsx` | Keep (no change) | Already has correct metadata |
| `packages/agent-api/app/api/health/route.ts` | Keep (no change) | Existing health check |

## Interfaces / Contracts

```typescript
// lib/env.ts
export const env: {
  CDP_API_KEY_ID: string;
  CDP_API_KEY_SECRET: string;
  CDP_WALLET_SECRET: string;
  NETWORK: 'base-sepolia' | 'base';
  URL: string;
};

// lib/accounts.ts
export function getOrCreateSellerAccount(): Promise<Account>;  // viem Account
export function getOrCreatePurchaserAccount(): Promise<Account>;

// lib/products.ts
import { Product, Money } from '@app/core';
export function getQuoteProduct(): Product;  // returns a static Product

// app/api/quote/route.ts
// GET → Response.json({ id: ProductId, name: string, price: { amount: bigint } })
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `GET /api/quote` returns correct JSON shape | Vitest, mockear `@app/core` import (ya funciona standalone) |
| Unit | `middleware.ts` bot regex matches known bot UAs | Vitest con fake `NextRequest` |
| Unit | `env.ts` validation rejects missing vars | Vitest, limpiar env antes de import |
| Integration | CDP wallet creation | SKIP — requiere API keys reales (documentado en spec) |

## Migration / Rollout

No migration required. `@app/agent-api` es un package independiente que se deploya por separado. El middleware y endpoints nuevos conviven con el health check existente.

## Open Questions

None.
