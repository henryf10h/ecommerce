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

## x402 Agent Payment Flow

The `agent-api` package implements the [x402 payment protocol](https://docs.cdp.coinbase.com/x402/welcome) — agents pay per-request via USDC on Base, no API keys or accounts required.

### How it works

```
Agent → GET /api/quote → 402 Payment Required (with pricing)
Agent → signs EIP-3009 TransferWithAuthorization with their wallet
Agent → GET /api/quote (with X-PAYMENT header) → 200 OK + product data
Server → verifies signature + USDC balance on-chain
Server → submits transferWithAuthorization to settle payment
```

### End-to-end simulation

The simulation creates two CDP wallets (Purchaser + Seller), runs the full x402 flow, and settles USDC on-chain.

**1. Set up environment variables**

Copy `.env.example` and fill in your CDP credentials:

```bash
cp packages/agent-api/.env.example packages/agent-api/.env.local
```

Required vars (get these from [CDP Portal](https://portal.cdp.coinbase.com)):
- `CDP_API_KEY_ID` — API key ID
- `CDP_API_KEY_SECRET` — API key secret (PEM format)
- `CDP_WALLET_SECRET` — wallet secret for server-signer wallets
- `NETWORK` — `base-sepolia` (default) or `base`

**2. Start the dev server**

```bash
pnpm --filter @app/agent-api dev
```

The server starts on `http://localhost:3001`.

**3. Run the simulation**

```bash
curl -s -X POST http://localhost:3001/api/simulate-buy | python3 -m json.tool
```

Or from a second terminal once the server is running.

**Expected output:**

```json
{
    "success": true,
    "data": {
        "id": "prod-agent-access",
        "name": "Agent API Access",
        "price": { "amount": "5000" }
    },
    "logs": [
        "🔍 Health check...",
        "🔍 Creating Purchaser wallet via CDP...",
        "  ✅ Purchaser: 0x...",
        "🔍 GET /api/quote (expect 402)...",
        "  ✅ x402Version: 1",
        "  ✅ Accepts: 1 option(s)",
        "  💰 Pay 5000 → 0x...",
        "🔍 Signing payment header...",
        "  ✅ Header: 644 chars",
        "🔍 GET /api/quote (with X-PAYMENT)...",
        "  ✅ Payment accepted!"
    ]
}
```

Server logs should show the on-chain settlement:

```
[x402] ✅ Settlement on-chain: 0x<tx-hash>
```

### Architecture

The x402 verification runs **locally** using viem — no external facilitator needed:

| Step | What | How |
|------|------|-----|
| Route matching | `computeRoutePatterns` + `findMatchingRoute` | `x402/shared` |
| 402 response | Payment requirements with price + seller address | Local middleware |
| Payment decode | Base64 → JSON → EIP-3009 payload | Local |
| Signature verify | `verifyTypedData` on USDC contract | viem + RPC |
| Balance check | `balanceOf` on USDC contract | viem + RPC |
| Settlement | `transferWithAuthorization` on USDC contract | CDP server-signer wallet |

Tokens automatically funded via CDP faucet on `base-sepolia`:
- **Purchaser**: USDC (if balance < $0.50)
- **Seller**: ETH (if balance < 0.01 ETH) — for gas
