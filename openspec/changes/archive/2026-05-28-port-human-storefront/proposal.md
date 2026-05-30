# Proposal: Port Human Storefront

## Intent

Port `onchain-commerce-template` (Coinbase) into `@app/web` — el human storefront con OnchainKit, productos, carrito y checkout. Reemplaza el placeholder actual por una tienda funcional que los humanos usan para comprar con USDC en Base.

## Scope

### In Scope
- OnchainKit setup: `OnchainProviders` (Wagmi + QueryClient + OnchainKitProvider + base chain)
- Store UI: `OnchainStore`, `OnchainStoreItems`, `OnchainStoreItem`, `OnchainStoreSummary`
- Cart state: `OnchainStoreProvider` (React Context con quantities), `QuantityInput`
- Cart bottom bar: `OnchainStoreCart` + `MockCheckoutButton` + `OnchainStoreModal`
- Coinbase Commerce API: `POST /api/charges` route
- Navigation: `Navbar` (responsive + mobile menu), `Banner` (demo notice)
- Tailwind CSS config + globals (matching template styles)
- Static product images + SVG components
- Config/links/types for the store
- Tests: OnchainStoreItem test ported

### Out of Scope
- Real checkout flow (commented out — mock mode, como template original)
- x402 protocol / agent payments (change #4)
- Database integration (change #5)
- Product data from DB (usa productos estáticos como el template)
- Biome linting (usamos ESLint existente)
- Refactor a domain types de `@app/core` (use presentation types por ahora)

## Capabilities

### New Capabilities
- `human-storefront`: Human-facing store UI con OnchainKit + Coinbase Commerce checkout

### Modified Capabilities
- `monorepo-skeleton`: `@app/web` pasa de scaffold placeholder a storefront real

## Approach

Port directo del template manteniendo estructura y naming. Se agregan las deps necesarias (`@coinbase/onchainkit`, `wagmi`, `tailwindcss`, etc.), se configura Tailwind, se copian componentes adaptando imports de `src/` a estructura monorepo. El checkout real queda comentado (mock mode), idéntico al template original.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/web/` | Modified | De scaffold a storefront completo |
| `packages/web/package.json` | Modified | Nuevas deps: onchainkit, wagmi, tailwind, postcss |
| `packages/web/app/` | Modified | Layout, page, + api/charges route |
| `packages/web/components/` | New | Todos los componentes del store |
| `packages/web/app/global.css` | New | Tailwind directives + estilos |
| `packages/web/tailwind.config.ts` | New | Tailwind config del template |
| `packages/web/postcss.config.js` | New | PostCSS con Tailwind |
| `openspec/specs/human-storefront/` | New | Specs del nuevo capability |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| OnchainKit peer deps conflict | Med | Pin onchainkit ^0.35 como template |
| Tailwind v3 setup en monorepo | Low | Config estándar, aislada en @app/web |
| Test con jsdom + Next.js | Low | Ya configurado en vitest desde skeleton |

## Rollback Plan

`git revert` del commit. `@app/web` vuelve al scaffold placeholder con `VERSION` import. `package.json` vuelve a deps originales.

## Dependencies

- `@app/core` (change #2) — import para VERSION y tipos de dominio
- `@coinbase/onchainkit` ^0.35.0
- `wagmi`, `viem`, `@tanstack/react-query`
- `tailwindcss` ^3.4, `postcss`, `autoprefixer`

## Success Criteria

- [ ] `pnpm --filter @app/web test` pasa (tests template + VERSION import)
- [ ] `pnpm --filter @app/web build` pasa (Next build exit 0)
- [ ] Store UI renderiza: productos, quantities, cart bottom bar
- [ ] `GET /` muestra la tienda (no el placeholder)
- [ ] `POST /api/charges` responde (con API key configurada)
- [ ] `pnpm lint` pasa — zero boundary violations
