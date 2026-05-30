# Tasks: Core Domain Model

## Phase 1: Foundation (VOs + Errors) — TDD

- [x] 1.1 RED: `src/errors.test.ts` — test discriminated union types (DomainError, NotFoundError, ValidationError, InsufficientFundsError)
- [x] 1.2 GREEN: `src/errors.ts` — implement discriminated union error types
- [x] 1.3 RED: `src/domain/value-objects/Money.test.ts` — test creation, arithmetic, comparison, rejection of negatives
- [x] 1.4 GREEN: `src/domain/value-objects/Money.ts` — implement Money(bigint) with add/subtract/compare/display
- [x] 1.5 RED: `src/domain/value-objects/ids.test.ts` — test branded type creation and type safety
- [x] 1.6 GREEN: `src/domain/value-objects/ids.ts` — implement ProductId, OrderId, PaymentId branded types

## Phase 2: Domain Entities — TDD

- [x] 2.1 RED: `src/domain/entities/Product.test.ts` — test creation, validation (empty name, missing price)
- [x] 2.2 GREEN: `src/domain/entities/Product.ts` — implement Product entity
- [x] 2.3 RED: `src/domain/entities/Order.test.ts` — test creation, status lifecycle, invalid transitions, total calculation
- [x] 2.4 GREEN: `src/domain/entities/Order.ts` — implement Order entity with LineItem, status transitions
- [x] 2.5 RED: `src/domain/entities/Payment.test.ts` — test Payment creation, Settlement confirmation
- [x] 2.6 GREEN: `src/domain/entities/Payment.ts` — implement Payment + Settlement entities

## Phase 3: Events + Services — TDD

- [x] 3.1 RED: `src/domain/events.test.ts` — test event creation with type discriminator
- [x] 3.2 GREEN: `src/domain/events.ts` — implement OrderPlaced, PaymentConfirmed event types
- [x] 3.3 RED: `src/application/services/PricingService.test.ts` — test calculateTotal with various line items
- [x] 3.4 GREEN: `src/application/services/PricingService.ts` — implement PricingService
- [x] 3.5 RED: `src/application/services/OrderService.test.ts` — test createOrder emits OrderPlaced event
- [x] 3.6 GREEN: `src/application/services/OrderService.ts` — implement OrderService
- [x] 3.7 GREEN: `src/application/ports/repositories.ts` — implement ProductRepository, OrderRepository, PaymentRepository interfaces

## Phase 4: Integration + Exports

- [x] 4.1 Create `src/domain/index.ts` — barrel re-exporting all domain types
- [x] 4.2 Create `src/application/index.ts` — barrel re-exporting services + ports
- [x] 4.3 Modify `src/index.ts` — add exports from domain, application, errors. Keep `VERSION`

## Phase 5: Verify

- [x] 5.1 Run `pnpm typecheck --filter @app/core` — must pass
- [x] 5.2 Run `pnpm test --filter @app/core` — all tests pass (new + existing VERSION smoke test)
- [x] 5.3 Run `pnpm lint` — zero boundary violations
