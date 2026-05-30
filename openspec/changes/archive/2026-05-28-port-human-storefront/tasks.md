# Tasks: Port Human Storefront

## Phase 1: Foundation

- [x] 1.1 Add deps to `packages/web/package.json`: onchainkit, wagmi, viem, @tanstack/react-query, tailwindcss, postcss, autoprefixer
- [x] 1.2 Create `packages/web/tailwind.config.ts` from template (screens, colors, fonts, content paths)
- [x] 1.3 Create `packages/web/postcss.config.cjs` (renamed to .cjs for ESM compat)
- [x] 1.4 Create `packages/web/vitest.setup.ts` with `@testing-library/jest-dom/vitest`
- [x] 1.5 Modify `packages/web/vitest.config.ts` to add `setupFiles` + components test pattern

## Phase 2: Config, Types & Utilities

- [x] 2.1 Create `packages/web/lib/config.ts` — env vars (COINBASE_COMMERCE_API_KEY, NEXT_PUBLIC_ONCHAINKIT_API_KEY, NEXT_PUBLIC_URL)
- [x] 2.2 Create `packages/web/lib/links.ts` — external URLs (GitHub, Docs, Discord, etc.)
- [x] 2.3 Create `packages/web/lib/types.ts` — Product, Quantities, NavbarLinkReact, etc.
- [x] 2.4 Create `packages/web/lib/wagmi.ts` — Wagmi config with explicit type annotation
- [x] 2.5 Create 7 SVG components in `packages/web/svg/` (CloseSvg, CoinbasePaySvg, ExternalLinkSvg, MenuSvg, MinusSvg, OnchainKitShopSvg, PlusSvg)
- [x] 2.6 Create 5 product images in `packages/web/images/` (jacket.png, airpods.png, mug.png, bottle.png, commerceScreen.png)
- [x] 2.7 Create `packages/web/hooks/useCreateCharge.ts` — fetch wrapper to POST /api/charges

## Phase 3: Providers

- [x] 3.1 Create `packages/web/components/OnchainProviders.tsx` — WagmiProvider + QueryClientProvider + OnchainKitProvider
- [x] 3.2 Create `packages/web/components/OnchainStoreProvider.tsx` — React Context with cart state (quantities, products, setQuantities)

## Phase 4: Store UI Components

- [x] 4.1 Create `packages/web/components/QuantityInput.tsx` — +/- controls with increment/decrement
- [x] 4.2 Create `packages/web/components/OnchainStoreItem.tsx` — product card (image, name, price, QuantityInput)
- [x] 4.3 Create `packages/web/components/OnchainStoreItems.tsx` — product grid from context
- [x] 4.4 Create `packages/web/components/OnchainStoreSummary.tsx` — store description panel
- [x] 4.5 Create `packages/web/components/OnchainStoreCart.tsx` — bottom bar with total + MockCheckoutButton
- [x] 4.6 Create `packages/web/components/MockCheckoutButton.tsx` — "Pay with Crypto" demo button
- [x] 4.7 Create `packages/web/components/OnchainStoreModal.tsx` — checkout demo modal
- [x] 4.8 Create `packages/web/components/Navbar.tsx` — responsive navbar with mobile menu
- [x] 4.9 Create `packages/web/components/Banner.tsx` — demo notice banner
- [x] 4.10 Create `packages/web/components/OnchainStore.tsx` — main store layout composing all components

## Phase 5: App Wiring

- [x] 5.1 Create `packages/web/app/global.css` — Tailwind directives + template styles
- [x] 5.2 Modify `packages/web/app/layout.tsx` — add OnchainProviders, OnchainKit CSS import, metadata
- [x] 5.3 Replace `packages/web/app/page.tsx` — render `<OnchainStore />` + VERSION badge
- [x] 5.4 Create `packages/web/app/api/charges/route.ts` — POST handler proxying to Coinbase Commerce API

## Phase 6: Tests & Verify

- [x] 6.1 Port `OnchainStoreItem.test.tsx` — render product, verify name, price, image, quantity input
- [x] 6.2 Update `packages/web/app/page.test.tsx` — verify store render + VERSION from @app/core
- [x] 6.3 Run `pnpm --filter @app/web test` — 2/2 tests pass ✅
- [x] 6.4 Run `pnpm --filter @app/web build` — Next build succeeds ✅
- [x] 6.5 Run `pnpm lint` from root — no boundary violations ✅
