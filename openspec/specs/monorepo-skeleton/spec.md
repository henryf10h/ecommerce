# Monorepo Skeleton Specification

## Purpose

Defines the workspace layout, package boundaries, and tooling contract that every future package in `commerce-x402` MUST satisfy. This is the foundation: future changes add domain code, UI, and the agent API ON TOP of this skeleton.

## Requirements

### Requirement: Workspace Layout

The repository MUST be a pnpm workspace managed by Turborepo with packages located under `packages/`.

#### Scenario: Fresh install resolves all workspaces

- GIVEN a fresh clone of the repo
- WHEN the developer runs `pnpm install` at the root
- THEN pnpm SHALL link all packages under `packages/` into `node_modules`
- AND Turborepo SHALL recognize all packages as part of the pipeline

#### Scenario: Workspace file is present and correct

- GIVEN the repo root
- WHEN inspecting `pnpm-workspace.yaml`
- THEN it MUST declare `packages: ['packages/*']`

### Requirement: Required Packages

The workspace MUST contain four packages with these exact names:
`@app/core`, `@app/web`, `@app/agent-api`, `@app/config`.

#### Scenario: Each package has a valid manifest

- GIVEN any package in `packages/`
- WHEN reading its `package.json`
- THEN it MUST declare its `name` matching `@app/*` convention
- AND it MUST declare a `private: true` field
- AND it MUST declare a `test` script

### Requirement: Core Package Purity

The `@app/core` package MUST NOT import from `@app/web` or `@app/agent-api`, and MUST NOT depend on any HTTP, Next.js, or x402 runtime libraries.

#### Scenario: ESLint rejects illegal upward import

- GIVEN a file in `packages/core/src/` that imports from `@app/web`
- WHEN running `pnpm lint`
- THEN ESLint SHALL fail with an import-boundary error
- AND the build SHALL NOT succeed

#### Scenario: Core has zero runtime dependencies

- GIVEN `packages/core/package.json`
- WHEN inspecting `dependencies` (runtime)
- THEN the field MUST be empty or omitted
- AND only `devDependencies` (TypeScript, Vitest, types) MAY be present

### Requirement: TypeScript Strict Mode

All packages MUST extend a shared `tsconfig.base.json` that enables `strict: true`.

#### Scenario: Typecheck passes across all packages

- GIVEN all packages installed
- WHEN running `pnpm typecheck` at root
- THEN `tsc --noEmit` SHALL run in every package
- AND it SHALL exit 0

#### Scenario: Each package extends the base config

- GIVEN any `packages/*/tsconfig.json`
- WHEN inspecting it
- THEN it MUST have `extends: "../../tsconfig.base.json"` (or equivalent relative path)

### Requirement: Smoke Tests Per Package

Each of `@app/core`, `@app/web`, `@app/agent-api` MUST ship with a Vitest smoke test that proves the toolchain runs.

#### Scenario: Smoke tests pass

- GIVEN a fresh install
- WHEN running `pnpm test` at root
- THEN Turborepo SHALL invoke each package's `test` script
- AND every package's smoke test SHALL pass

### Requirement: Shared Tooling via @app/config

ESLint and Prettier configurations MUST be defined once in `@app/config` and consumed by every other package.

#### Scenario: Linting is consistent across packages

- GIVEN any package
- WHEN it runs ESLint
- THEN it MUST use the flat config exported by `@app/config`
- AND the rules MUST be identical across all packages

#### Scenario: Boundary rule is enforced

- GIVEN the shared ESLint config
- WHEN linting any file
- THEN the config MUST include a boundary rule (e.g., `eslint-plugin-boundaries` or equivalent) that forbids `@app/core` from importing `@app/web` or `@app/agent-api`

### Requirement: Reproducible Toolchain Versions

The repo MUST pin Node and pnpm versions so all contributors get identical behavior.

#### Scenario: Versions are pinned

- GIVEN the repo root
- WHEN inspecting the workspace
- THEN `.nvmrc` MUST exist and pin Node `>=20`
- AND root `package.json` MUST declare a `packageManager` field pinning `pnpm@9.x` or newer
- AND `engines.node` MUST be `>=20`

### Requirement: Web and Agent-API Are Next.js-Ready

The `@app/web` package SHALL be the human-facing storefront with product, payment, and business logic. The `@app/agent-api` package MUST remain a minimal Next.js scaffold and MUST NOT yet contain product, payment, or business logic. Both MUST declare `next` (^14, App Router) as a dependency.

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
