# Tasks: Bootstrap Monorepo

## Phase 1: Root Workspace

- [x] 1.1 Create `package.json` (root): `private: true`, `packageManager: pnpm@9.15.0`, `engines.node: ">=20"`, scripts `test`/`typecheck`/`lint`/`build` → `turbo run <task>`
- [x] 1.2 Create `pnpm-workspace.yaml` with `packages: ['packages/*']`
- [x] 1.3 Create `turbo.json` with pipeline `test`, `typecheck`, `lint`, `build` (and `dependsOn: ['^build']` for build)
- [x] 1.4 Create `tsconfig.base.json` with `strict: true`, `target: ES2022`, `moduleResolution: bundler`, `skipLibCheck: true`
- [x] 1.5 Create `.nvmrc` with `20`
- [x] 1.6 Create `.editorconfig` (LF, utf-8, indent 2)
- [x] 1.7 Create `.gitignore` (node_modules, .next, .turbo, dist, coverage, .env*)
- [x] 1.8 Create `README.md` documenting layout, scripts, and the boundary contract

## Phase 2: Shared Config Package

- [x] 2.1 Create `packages/config/package.json` (`@app/config`, exports `./eslint`, `./prettier`, `./tsconfig`)
- [x] 2.2 Create `packages/config/eslint.config.mjs` with flat config + `eslint-plugin-boundaries` rule (web→core OK, agent-api→core OK, core→others FORBIDDEN)
- [x] 2.3 Create `packages/config/prettier.config.mjs` (single-quote, semi, trailing-comma all)
- [x] 2.4 Create `packages/config/tsconfig.json` extending base

## Phase 3: Core Package (TDD)

- [x] 3.1 Create `packages/core/package.json` (`@app/core`, no runtime deps, devDeps: vitest, typescript, @app/config, eslint)
- [x] 3.2 Create `packages/core/tsconfig.json` extending base
- [x] 3.3 Create `packages/core/eslint.config.mjs` re-exporting `@app/config/eslint`
- [x] 3.4 RED: create `packages/core/src/index.test.ts` asserting `VERSION === '0.0.0'`
- [x] 3.5 GREEN: create `packages/core/src/index.ts` with `export const VERSION = '0.0.0'`
- [x] 3.6 Create `packages/core/vitest.config.ts`

## Phase 4: Web Package (TDD)

- [x] 4.1 Create `packages/web/package.json` (`@app/web`, deps: next ^14, react ^18, react-dom ^18, @app/core; devDeps: vitest, @testing-library/react, jsdom)
- [x] 4.2 Create `packages/web/tsconfig.json` extending base with Next plugin
- [x] 4.3 Create `packages/web/next.config.mjs` with `transpilePackages: ['@app/core']`
- [x] 4.4 Create `packages/web/eslint.config.mjs` re-exporting `@app/config/eslint`
- [x] 4.5 RED: create `packages/web/app/page.test.tsx` rendering `<Page />` and asserting text content
- [x] 4.6 GREEN: create `packages/web/app/page.tsx` returning `<h1>commerce-x402 web</h1>`
- [x] 4.7 Create `packages/web/app/layout.tsx` (minimal `<html><body>{children}</body></html>`)
- [x] 4.8 Create `packages/web/vitest.config.ts` with jsdom env

## Phase 5: Agent-API Package (TDD)

- [x] 5.1 Create `packages/agent-api/package.json` (`@app/agent-api`, deps: next ^14, @app/core; devDeps: vitest)
- [x] 5.2 Create `packages/agent-api/tsconfig.json` extending base with Next plugin
- [x] 5.3 Create `packages/agent-api/next.config.mjs` with `transpilePackages: ['@app/core']`
- [x] 5.4 Create `packages/agent-api/eslint.config.mjs` re-exporting `@app/config/eslint`
- [x] 5.5 RED: create `packages/agent-api/app/api/health/route.test.ts` asserting GET returns `{ ok: true }`
- [x] 5.6 GREEN: create `packages/agent-api/app/api/health/route.ts` exporting `GET` handler
- [x] 5.7 Create `packages/agent-api/app/layout.tsx` (minimal)
- [x] 5.8 Create `packages/agent-api/vitest.config.ts`

## Phase 6: Install & Verify

> Deferred to the user — global rule "Never build after changes". The user runs these manually; sdd-verify in the next phase validates the structure statically.

- [x] 6.1 Run `pnpm install` at root — verify all workspaces resolve
- [x] 6.2 Run `pnpm typecheck` — must pass for all 4 packages
- [x] 6.3 Run `pnpm test` — all 3 smoke tests pass via Turborepo
- [x] 6.4 Run `pnpm lint` — passes clean (root single-pass `eslint packages`)
- [x] 6.5 Boundary smoke: confirmed enforcement via `no-restricted-imports` (replaced boundaries plugin — see verify-report)
- [x] 6.6 Run `pnpm --filter @app/web build` and `pnpm --filter @app/agent-api build` — both succeed
