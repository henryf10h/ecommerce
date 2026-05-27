# Design: Bootstrap Monorepo

## Technical Approach

Standard pnpm + Turborepo layout. Root holds workspace config + shared tooling. Four packages under `packages/`. Strict TypeScript everywhere via a shared base. ESLint flat config with an explicit boundary rule enforces Clean Architecture at lint time. Each package ships a one-line Vitest smoke test so `pnpm test` proves the toolchain on day one.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Workspace tool | pnpm + Turborepo | Nx, Bun workspaces, npm workspaces | pnpm is fastest for monorepos; Turborepo has the smallest mental footprint for caching task graphs; Nx is overkill for 4 packages |
| Package naming | `@app/*` scope | `@commerce-x402/*` | Short, ergonomic in imports; the repo name appears on disk, not in code |
| Layout | `packages/*` (flat) | `apps/` + `packages/` split | Only 4 packages — splitting adds ceremony without value at this scale |
| Boundary enforcement | `eslint-plugin-boundaries` | TypeScript project references only, `dependency-cruiser` | tsc references catch type-level deps but not runtime imports; dep-cruiser is heavy; ESLint plugin is in the lint pass already |
| Shared configs | `@app/config` package | Root-level configs duplicated | One source of truth, consumed by `import('@app/config/eslint')` etc. |
| Test runner | Vitest | Jest, node:test | Native ESM, fastest, works identically in Next packages |
| Next.js version | `next@^14` (App Router) | 13 (Pages), 15 (latest) | Both source templates target v14 App Router; v15 still has rough edges for x402-style middleware |
| Node version | `>=20` | 18 LTS | Native fetch + stable test runner; 18 hits EOL soon |
| Package manager pin | `packageManager` field + `.nvmrc` | Volta, asdf | Built-in to Corepack, zero extra tooling |

## Data Flow

This change has no runtime data flow — it's pure scaffolding. The build-time flow:

```
  developer
     │
     ▼
  pnpm install ───► pnpm-workspace.yaml ───► packages/* manifests
     │
     ▼
  pnpm <task> ───► turbo.json ──┬─► @app/core    (vitest)
                                ├─► @app/web     (vitest, next build)
                                ├─► @app/agent-api (vitest, next build)
                                └─► @app/config  (no tasks)
```

ESLint boundary rule (build-time enforcement):

```
  @app/web      ─┐
  @app/agent-api ┼──► may import ──► @app/core
                 │                       │
                 │                       ▼
                 │                  (no imports out)
  @app/core ─────┴── MUST NOT import @app/web | @app/agent-api
```

## File Changes

| File | Action | Description |
|---|---|---|
| `package.json` | Create | Root workspace, `packageManager: pnpm@9.x`, scripts (`test`, `typecheck`, `lint`, `build`) delegating to Turborepo |
| `pnpm-workspace.yaml` | Create | `packages: ['packages/*']` |
| `turbo.json` | Create | Pipeline: `test`, `typecheck`, `lint`, `build` |
| `tsconfig.base.json` | Create | Strict TS, target ES2022, moduleResolution `bundler` |
| `.nvmrc` | Create | `20` |
| `.editorconfig` | Create | LF, utf-8, 2-space indent |
| `.gitignore` | Create | node_modules, .next, .turbo, dist, coverage |
| `README.md` | Create | Layout, scripts, package boundary contract |
| `packages/config/package.json` | Create | `@app/config`, exports `./eslint`, `./prettier`, `./tsconfig` |
| `packages/config/eslint.config.mjs` | Create | Flat config, includes boundaries plugin + rule |
| `packages/config/prettier.config.mjs` | Create | Shared formatting |
| `packages/config/tsconfig.json` | Create | Extends base |
| `packages/core/package.json` | Create | `@app/core`, no runtime deps, dev: vitest + tsx |
| `packages/core/src/index.ts` | Create | `export const VERSION = '0.0.0'` |
| `packages/core/src/index.test.ts` | Create | Smoke test asserting VERSION |
| `packages/core/tsconfig.json` | Create | Extends base |
| `packages/web/package.json` | Create | `@app/web`, next ^14, react ^18 |
| `packages/web/app/page.tsx` | Create | Static placeholder `<h1>commerce-x402 web</h1>` |
| `packages/web/app/page.test.tsx` | Create | Smoke test rendering placeholder |
| `packages/web/next.config.mjs` | Create | Transpile `@app/core` |
| `packages/web/tsconfig.json` | Create | Extends base + next |
| `packages/agent-api/package.json` | Create | `@app/agent-api`, next ^14 |
| `packages/agent-api/app/api/health/route.ts` | Create | `GET /api/health` returns `{ ok: true }` |
| `packages/agent-api/app/api/health/route.test.ts` | Create | Smoke test on the route handler |
| `packages/agent-api/next.config.mjs` | Create | Transpile `@app/core` |
| `packages/agent-api/tsconfig.json` | Create | Extends base + next |

## Interfaces / Contracts

ESLint boundary rule (in `@app/config/eslint`):

```js
{
  'boundaries/element-types': ['error', {
    default: 'disallow',
    rules: [
      { from: 'web',       allow: ['core', 'shared'] },
      { from: 'agent-api', allow: ['core', 'shared'] },
      { from: 'core',      allow: ['core'] },
    ],
  }]
}
```

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit | Smoke test per package | Vitest asserts a trivial export/render — proves toolchain works |
| Integration | Cross-package import via Next transpile | `web` imports `VERSION` from `@app/core` and renders it (covered in change #3); deferred here |
| E2E | None | Out of scope for skeleton |
| Lint check | Boundary violation | Add a temporary fixture in CI later; for this change, manual smoke (create a violating file, run `pnpm lint`, confirm fail, delete file) |

## Migration / Rollout

No migration — empty repo. No feature flags needed.

## Open Questions

- [ ] Confirm pnpm 9 vs pnpm 10 — going with `pnpm@9` (latest stable). Bumpable in change #2 without breaking changes.
- [ ] React 18 vs 19 — pinning React 18 to match `next@14`. Next 15 + React 19 deferred.
