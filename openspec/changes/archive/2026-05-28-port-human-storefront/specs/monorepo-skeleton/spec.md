# Delta for Monorepo Skeleton

## MODIFIED Requirements

### Requirement: Web and Agent-API Are Next.js-Ready

The `@app/web` package SHALL be the human-facing storefront with product, payment, and business logic. The `@app/agent-api` package MUST remain a minimal Next.js scaffold and MUST NOT yet contain product, payment, or business logic. Both MUST declare `next` (^14, App Router) as a dependency.
(Previously: Both `@app/web` and `@app/agent-api` MUST NOT yet contain product, payment, or business logic.)

#### Scenario: Web storefront builds

- GIVEN `packages/web`
- WHEN running `pnpm --filter @app/web build`
- THEN the Next.js build SHALL succeed
- AND it SHALL produce a storefront route at `/`

#### Scenario: Agent-api remains scaffold

- GIVEN `packages/agent-api`
- WHEN running `pnpm --filter @app/agent-api build`
- THEN the Next.js build SHALL succeed
- AND it SHALL produce a default route returning a static placeholder
