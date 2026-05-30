# Design: Port Human Storefront

## Technical Approach

Port directo del template `coinbase/onchain-commerce-template` a `@app/web` adaptando imports de `src/` a estructura monorepo. Se reemplaza el scaffold placeholder completo con el storefront OnchainKit. Mock checkout se mantiene comentado (igual que el template upstream).

## Architecture Decisions

### Decision: Component Organization

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Template `src/` → `app/` | Next.js App Router routes vs UI components mezclados | UI components → `components/`, router files → `app/`, config/types → `lib/` |
| Template `src/` → `components/` | Clara separación, import paths consistentes | ✅ **Elegido** |

**Rationale**: Separar responsabilidades — `app/` solo para Next.js routes y layouts, `components/` para UI, `lib/` para config/utils. Sigue el patrón existente del monorepo.

### Decision: Import Paths

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Relative imports (`../lib/config`) | Verboso pero explícito | ✅ **Elegido** (consistente con monorepo) |
| `@/` path alias | Más limpio pero requiere config adicional | ❌ Descartado (complejidad extra innecesaria) |

**Rationale**: El template usa `src/` alias. En monorepo las referencias son relativas — mantenemos consistencia. Sin alias paths para evitar configurar tsconfig paths extra.

### Decision: Mock Checkout

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Template default (mock comentado) | Demo-safe, user activa con env var | ✅ **Elegido** (idéntico al template) |
| Habilitar checkout real | Requiere API keys, riesgo en dev | ❌ Descartado — out of scope |

**Rationale**: El template upstream tiene el checkout real comentado con `TODO` comments. Lo mantenemos exactamente igual. MockCheckoutButton y OnchainStoreModal se portan tal cual.

## Migration

### File Changes

| File | Action | Source |
|------|--------|--------|
| `packages/web/app/layout.tsx` | Modify | Agregar OnchainProviders + OnchainKit CSS + metadata |
| `packages/web/app/page.tsx` | Replace | De placeholder a `<OnchainStore />` |
| `packages/web/app/page.test.tsx` | Modify | Test actualizado para storefront |
| `packages/web/app/api/charges/route.ts` | Create | POST /api/charges (Coinbase Commerce proxy) |
| `packages/web/app/global.css` | Create | Tailwind directives + template styles |
| `packages/web/components/Banner.tsx` | Create | Demo notice banner |
| `packages/web/components/MockCheckoutButton.tsx` | Create | Mock Pay with Crypto button |
| `packages/web/components/Navbar.tsx` | Create | Responsive navbar with mobile menu |
| `packages/web/components/OnchainProviders.tsx` | Create | Wagmi + QueryClient + OnchainKit wrapper |
| `packages/web/components/OnchainStore.tsx` | Create | Main store layout |
| `packages/web/components/OnchainStoreCart.tsx` | Create | Bottom cart bar (mock checkout) |
| `packages/web/components/OnchainStoreItem.tsx` | Create | Product card |
| `packages/web/components/OnchainStoreItem.test.tsx` | Create | Product card tests |
| `packages/web/components/OnchainStoreItems.tsx` | Create | Product grid |
| `packages/web/components/OnchainStoreModal.tsx` | Create | Checkout demo modal |
| `packages/web/components/OnchainStoreProvider.tsx` | Create | Cart Context + static products |
| `packages/web/components/OnchainStoreSummary.tsx` | Create | Store description panel |
| `packages/web/components/QuantityInput.tsx` | Create | +/- quantity controls |
| `packages/web/hooks/useCreateCharge.ts` | Create | Create charge HTTP hook |
| `packages/web/images/*.png` | Create | 5 static product images |
| `packages/web/svg/*.tsx` | Create | 7 SVG icon components |
| `packages/web/lib/config.ts` | Create | Env vars (OnchainKit API key, Commerce API key) |
| `packages/web/lib/links.ts` | Create | External URLs (GitHub, Docs, etc.) |
| `packages/web/lib/types.ts` | Create | TypeScript interfaces for store |
| `packages/web/lib/wagmi.ts` | Create | Wagmi config (base chain, coinbase wallet) |
| `packages/web/tailwind.config.ts` | Create | Tailwind config from template |
| `packages/web/postcss.config.js` | Create | PostCSS with Tailwind plugin |
| `packages/web/vitest.setup.ts` | Create | `@testing-library/jest-dom/vitest` |
| `packages/web/vitest.config.ts` | Modify | Add `setupFiles` reference |
| `packages/web/package.json` | Modify | Add: onchainkit, wagmi, viem, @tanstack/react-query, tailwindcss, postcss, autoprefixer |

### Data Flow

```
User → page.tsx → OnchainStore
                      ├── OnchainStoreProvider (cart context)
                      ├── Banner
                      ├── Navbar
                      ├── OnchainStoreSummary
                      ├── OnchainStoreItems
                      │     └── OnchainStoreItem × N
                      │           └── QuantityInput (+/-)
                      └── OnchainStoreCart
                            ├── MockCheckoutButton → OnchainStoreModal
                            └── [commented: Checkout → useCreateCharge → POST /api/charges → Coinbase Commerce API]
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `OnchainStoreItem` | Port template test: renderiza producto, nombre, precio, imagen, quantity input |
| Unit | Home page | Update placeholder test: verifica que store renderiza |
| Unit | Components | Básico: componentes renderizan sin crash (jsdom) |

No se testea el modal, cart, ni API route en este cambio — los tests unitarios cubren lo crítico. El template original solo tiene 1 test (`OnchainStoreItem.test.tsx`).

## Open Questions

- None. Template está completamente entendido, el port es directo.

