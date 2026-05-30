# Design: Core Domain Model

## Technical Approach

Pure TypeScript domain siguiendo Clean Architecture con 3 capas: `domain/` (entities, value-objects, events), `application/` (ports, services), `errors/`. Zero runtime deps. Tests en RED→GREEN estricto. API pública via barrel exports desde `index.ts`.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Precios | `bigint` (6 dec) | `number`, `Decimal.js` | USDC = 6 decimals; bigint nativo, sin deps, evita floating point |
| Errores | Discriminated unions | Clases con `extends Error` | Pattern matching nativo, serializable, sin try/catch forzado |
| Repository interfaces | `interface` TS | Clases abstractas, generics | Son contratos puros — interfaces es el mínimo necesario |
| Domain events | Plain objects + type discriminator | EventEmitter, lib externa | Zero deps, serializable, testeable |
| Estructura | Plana por capa | DDD aggregates, CQRS | Solo 3-4 entidades — over-engineering evitado |
| IDs | Branded types (`string & {__brand}`) | `string` plano, `number` | Type safety en parámetros sin overhead runtime |

## Data Flow

```
Consumer (@app/web | @app/agent-api)
         │
         ▼  import { Product, Money, ... } from '@app/core'
  ┌──────────────┐
  │   index.ts   │  ← barrel: re-exporta API pública + VERSION
  ├──────────────┤
  │ application/ │  ← OrderService, PricingService + interfaces repos
  ├──────────────┤
  │   domain/    │  ← Product, Order, Payment, Money, events
  └──────────────┘

Event flow (creación de orden):
  OrderService.createOrder(items)
    → Order(entity) se crea con status "pending"
    → OrderPlaced{ orderId, total, timestamp } se emite
    → PaymentService.recordPayment(orderId, amount)
      → Payment(entity) status "pending"
      → Settlement confirma → PaymentConfirmed{ ... } se emite
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/domain/value-objects/Money.ts` | Create | `Money(bigint)` — arithmetic, compare, display |
| `src/domain/value-objects/ids.ts` | Create | `ProductId`, `OrderId`, `PaymentId` (branded `string`) |
| `src/domain/entities/Product.ts` | Create | `Product { id, name, price, image }` |
| `src/domain/entities/Order.ts` | Create | `Order { id, items, total, status }` + lifecycle |
| `src/domain/entities/Payment.ts` | Create | `Payment` + `Settlement` con referencias |
| `src/domain/events.ts` | Create | Event types con `type` discriminator |
| `src/domain/index.ts` | Create | Barrel: re-exporta todo domain público |
| `src/application/ports/repositories.ts` | Create | Interfaces: `ProductRepository`, `OrderRepository`, `PaymentRepository` |
| `src/application/services/PricingService.ts` | Create | `calculateTotal(items)` — sum line items |
| `src/application/services/OrderService.ts` | Create | `createOrder(items)` — crea Order + emite eventos |
| `src/application/index.ts` | Create | Barrel: re-exporta servicios + ports |
| `src/errors.ts` | Create | `DomainError` discriminated union |
| `src/index.ts` | Modify | Agrega exports domain + application + errors. Mantiene `VERSION` |
| `src/**/*.test.ts` | Create | Tests RED→GREEN para cada entidad, VO, service |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Money VO | Operaciones aritméticas, comparación, serialización, edge cases |
| Unit | Product entity | Creación válida/inválida, validación de name |
| Unit | Order entity | Status lifecycle, transiciones inválidas, cálculo de total |
| Unit | Payment entity | Creación, settlement, event emission |
| Unit | OrderService | Integración domain + eventos |
| Unit | Error types | Pattern matching discriminado |

## Migration / Rollout

No migration required. Código nuevo en paquete existente. `VERSION` export preservado — cero breaking changes.

## Open Questions

None.
