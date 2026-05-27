# Proposal: Bootstrap Monorepo Skeleton

## Intent

The repo is empty. Before we can port `onchain-commerce-template` (human UI) or `x402-ai-starter` (agent API) and unify them around a shared domain, we need a working monorepo skeleton: pnpm workspaces, Turborepo, three empty packages with correct boundaries, and shared tooling (TypeScript, Vitest, ESLint, Prettier). This is foundation-only — no product, order, or payment code yet.

## Scope

### In Scope
- Root `package.json` + `pnpm-workspace.yaml` + `turbo.json`
- Three empty packages: `@app/core`, `@app/web`, `@app/agent-api`
- Shared `tsconfig.base.json` with strict mode
- Vitest configured at workspace level (each package can opt in)
- ESLint flat config + Prettier with shared config package `@app/config`
- `.gitignore`, `.editorconfig`, `.nvmrc`
- Smoke test in each package proving the toolchain works
- README at root documenting the layout

### Out of Scope
- Any product, order, inventory, or payment code (change #2)
- Porting `onchain-commerce-template` (change #3)
- Porting `x402-ai-starter` (change #4)
- Database (Postgres/Drizzle) — added when core needs it
- CI pipelines, deployment, identity layer

## Capabilities

### New Capabilities
- `monorepo-skeleton`: defines the workspace layout, package boundaries, and tooling contract that every future package must satisfy.

### Modified Capabilities
None.

## Approach

Standard pnpm + Turborepo layout. Three packages live under `packages/`. The `@app/core` package has zero runtime deps (pure TS domain). `@app/web` and `@app/agent-api` are reserved as Next.js apps but ship as empty scaffolds in this change. ESLint enforces an import boundary: nothing in `@app/core/**` may import from `@app/web` or `@app/agent-api`. A `pnpm test` at root runs Turborepo which fans out to each package's smoke test.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `/` (root config) | New | package.json, turbo.json, pnpm-workspace.yaml, tsconfig.base.json, .gitignore |
| `packages/core` | New | Empty domain package with smoke test |
| `packages/web` | New | Empty Next.js-ready package with smoke test |
| `packages/agent-api` | New | Empty Next.js-ready package with smoke test |
| `packages/config` | New | Shared ESLint + Prettier + tsconfig configs |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Wrong Next.js version locks future ports | Med | Pin `next@^14`, latest stable App Router |
| Import-boundary lint not enforced | Med | Add eslint-plugin-boundaries rule in change #1 |
| pnpm/Turbo version drift across machines | Low | `packageManager` field in root + `.nvmrc` |

## Rollback Plan

`rm -rf` the repo contents. There is no prior state to preserve (empty repo). Git is not initialized yet, so rollback is trivial.

## Dependencies

- Node.js 20+ (pin in `.nvmrc`)
- pnpm 9+ available globally

## Success Criteria

- [ ] `pnpm install` succeeds at root
- [ ] `pnpm test` runs Vitest in all three packages and passes
- [ ] `pnpm typecheck` passes across all packages
- [ ] `pnpm lint` passes and rejects an illegal `@app/core → @app/web` import
- [ ] All three packages have correct names (`@app/core`, `@app/web`, `@app/agent-api`)
