# Core Domain Specification

## Purpose

Defines the pure domain model shared by `@app/web` (human storefront) and `@app/agent-api` (x402 agent). Products, pricing, orders, and payment settlement — with zero infrastructure concerns.

## Requirements

### Requirement: Money Value Object

The system MUST represent monetary amounts as a `Money` value object wrapping `bigint` (6 decimal places for USDC).

#### Scenario: Money is created from bigint cents

- GIVEN a `bigint` value `1000000` (1 USDC)
- WHEN creating a `Money` from that value
- THEN the `amount` field SHALL equal `1000000n`
- AND `toDisplay()` SHALL return `"1.00"`

#### Scenario: Money rejects negative values

- GIVEN a negative `bigint` value
- WHEN creating a `Money` from that value
- THEN the operation SHALL throw a `ValidationError`
- AND the error message SHALL include "negative"

#### Scenario: Money supports arithmetic

- GIVEN two `Money` instances: `Money(500000n)` and `Money(250000n)`
- WHEN calling `add()`
- THEN the result SHALL equal `Money(750000n)`
- WHEN calling `subtract()`
- THEN the result SHALL equal `Money(250000n)`

#### Scenario: Money supports comparison

- GIVEN `a = Money(1000000n)` and `b = Money(2000000n)`
- WHEN calling `a.isGreaterThan(b)`
- THEN it SHALL return `false`
- WHEN calling `a.isLessThan(b)`
- THEN it SHALL return `true`
- WHEN calling `a.equals(a)`
- THEN it SHALL return `true`

### Requirement: Product Entity

The system MUST define a `Product` entity with `id`, `name`, `price` (Money), and `image`.

#### Scenario: Product is created with valid data

- GIVEN valid product data (id, name, price, image)
- WHEN creating a `Product`
- THEN the entity SHALL have all fields populated as provided
- AND the `price` SHALL be a `Money` instance

#### Scenario: Product rejects empty name

- GIVEN product data with an empty string as `name`
- WHEN creating a `Product`
- THEN the operation SHALL throw a `ValidationError`

### Requirement: Order Entity

The system MUST define an `Order` entity with `id`, line items, `total` (Money), and a status lifecycle.

#### Scenario: Order is created with Pending status

- GIVEN a list of line items (product + quantity)
- WHEN creating an `Order`
- THEN the status SHALL be `pending`
- AND the `total` SHALL equal the sum of line item prices

#### Scenario: Order transitions through status lifecycle

- GIVEN an `Order` with status `pending`
- WHEN confirming the order
- THEN the status SHALL transition to `confirmed`
- WHEN completing settlement
- THEN the status SHALL transition to `completed`
- WHEN cancelling from `pending`
- THEN the status SHALL transition to `cancelled`

#### Scenario: Order rejects invalid transition

- GIVEN an `Order` with status `completed`
- WHEN attempting to cancel it
- THEN the operation SHALL throw a `DomainError`
- AND the error message SHALL include "cannot transition"

### Requirement: Payment/Settlement Entity

The system MUST define a `Payment` entity recording method, amount (Money), status, and order reference. A `Settlement` records the on-chain completion.

#### Scenario: Payment is recorded for an order

- GIVEN an `Order` with a calculated total
- WHEN recording a `Payment` for that order
- THEN the payment SHALL have status `pending`
- AND it SHALL reference the order by `OrderId`

#### Scenario: Settlement confirms on-chain payment

- GIVEN a `Payment` with status `pending`
- WHEN recording a `Settlement` with a transaction hash
- THEN the settlement SHALL have status `completed`
- AND the payment status SHALL update to `completed`

### Requirement: Repository Interfaces

The system MUST define `ProductRepository`, `OrderRepository`, and `PaymentRepository` as TypeScript interfaces in `application/ports/`. They SHALL NOT include any database or HTTP implementation.

#### Scenario: Repository interfaces are pure contracts

- GIVEN any repository interface in `application/ports/`
- WHEN inspecting its definition
- THEN it SHALL contain only method signatures
- AND it SHALL NOT import from any database, HTTP, or framework library

### Requirement: Domain Events

The system MUST emit domain events for key state changes. Events SHALL be plain objects with a `type` discriminator and timestamp.

#### Scenario: OrderPlaced event fires on creation

- GIVEN valid line items
- WHEN creating an `Order`
- THEN an `OrderPlaced` event SHALL be emitted with `orderId`, `total`, and `timestamp`

#### Scenario: PaymentConfirmed event fires on settlement

- GIVEN a `Payment` that has been settled
- WHEN the settlement completes
- THEN a `PaymentConfirmed` event SHALL be emitted with `paymentId`, `orderId`, `amount`, and `transactionHash`

### Requirement: Domain Errors

The system MUST define error types as discriminated unions: `DomainError` (base), `NotFoundError`, `ValidationError`, `InsufficientFundsError`.

#### Scenario: Error types are discriminated

- GIVEN any domain error
- WHEN inspecting its `type` property
- THEN it SHALL be one of: `"domain"`, `"not-found"`, `"validation"`, `"insufficient-funds"`

### Requirement: Core Purity Preserved

The domain layer MUST NOT import from `@app/web`, `@app/agent-api`, or any HTTP/Next.js/x402 runtime library.

#### Scenario: Zero runtime deps maintained

- GIVEN `packages/core/package.json`
- WHEN inspecting `dependencies`
- THEN it MUST remain empty
- AND the existing `VERSION` export SHALL still be present in `index.ts`
