# commerce-x402

Hybrid e-commerce platform on Base + USDC. Humans buy through a Next.js storefront; AI agents buy through an x402-gated HTTP API. Both share a single pure-domain core.

## Layout

```
packages/
├── core/        @app/core        Pure domain: products, inventory, orders, settlement.
│                                 NO HTTP, NO Next.js, NO x402 imports.
├── web/         @app/web         Next.js storefront for humans (port of onchain-commerce-template).
├── agent-api/   @app/agent-api   Next.js x402-gated API for agents (port of x402-ai-starter).
└── config/      @app/config      Shared ESLint + Prettier + TS configs.
```

## Boundary Contract

ESLint enforces this:

- `@app/web` may import from `@app/core` ✅
- `@app/agent-api` may import from `@app/core` ✅
- `@app/core` MUST NOT import from `@app/web` or `@app/agent-api` ❌

Violating it fails `pnpm lint`. This is what keeps the domain pure.

## Scripts

```bash
pnpm install      # install everything
pnpm test         # run vitest across all packages
pnpm typecheck    # tsc --noEmit across all packages
pnpm lint         # eslint across all packages
pnpm build        # production build (only @app/web and @app/agent-api have one)
pnpm dev          # run dev servers
```

## Requirements

- Node `>=20` (`.nvmrc` pinned)
- pnpm `>=9` (via Corepack)
