# Proposal: Core Domain Model

## Intent

`@app/core` solo exporta `VERSION = '0.0.0'`. No podemos portear `onchain-commerce-template` (human storefront) ni `x402-ai-starter` (agent API) sin un modelo de dominio compartido: productos, precios, órdenes y pagos. Este change construye esa base.

## Scope

### In Scope
- Value Objects: `Money` (bigint, 6 decimals USDC), `ProductId`, `OrderId`, `PaymentId`
- Entity: `Product` (id, name, price, image)
- Entity: `Order` (line items, total, status lifecycle)
- Entity: `Payment` / `Settlement` (method, amount, status, reference)
- Domain service: `PricingService` (calcular totales)
- Repository interfaces: `ProductRepository`, `OrderRepository`, `PaymentRepository`
- Domain events: `OrderPlaced`, `PaymentConfirmed`, `SettlementCompleted`
- Error types: `DomainError`, `NotFoundError`, `ValidationError`

### Out of Scope
- DB implementations (Drizzle/Postgres)
- HTTP routes, API handlers
- x402 protocol, CDP wallets
- OnchainKit / Checkout components
- Auth / identity
- Cart/quantity state management (presentation)

## Capabilities

### New Capabilities
- `core-domain`: Domain model for Product, Order, Payment — shared by web and agent-api

### Modified Capabilities
- `monorepo-skeleton`: `@app/core` pasa de scaffold a dominio real (spec actualizada)

## Approach

Pure TypeScript domain siguiendo Clean Architecture. **Zero runtime dependencies**. Carpetas:

```
packages/core/src/
├── domain/
│   ├── entities/       (Product, Order, Payment)
│   ├── value-objects/  (Money, IDs)
│   └── events/         (OrderPlaced, PaymentConfirmed)
├── application/
│   ├── ports/          (Repository interfaces)
│   └── services/       (PricingService)
└── errors/             (DomainError types)
```

Precios como `bigint` (no `number`), errores con discriminated unions. Cada entidad con su test en RED→GREEN.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/core/src/` | Modified | De scaffold a dominio completo |
| `packages/core/src/index.ts` | Modified | Exporta domain público |
| `openspec/specs/monorepo-skeleton/spec.md` | Modified | Actualizar R3 (core purity sigue igual) |
| `openspec/specs/core-domain/` | New | Specs del nuevo capability |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Over-engineering temprano | Med | Solo modelar lo que los templates requieren |
| Precios `number` vs `bigint` | Low | Usar `bigint` desde el día 1 (USDC = 6 decimals) |
| Romper smoke test existente | Low | Mantener `VERSION` export + test original |

## Rollback Plan

`git revert` del commit del change. El `@app/core` vuelve a `export const VERSION = '0.0.0'`. Ningún otro paquete depende de los nuevos tipos todavía.

## Dependencies

- Node 20+, pnpm 9+
- Monorepo skeleton (change #1 — completo)

## Success Criteria

- [ ] `pnpm typecheck` pasa en `@app/core`
- [ ] `pnpm test` corre tests del dominio (no rotura de smoke test original)
- [ ] `pnpm lint` pasa — zero violations de boundary
- [ ] `VERSION` export se mantiene (backwards compat)
- [ ] `Money` usa `bigint`, rechaza `number` en constructor
- [ ] Repository interfaces existen — sin implementación concreta
