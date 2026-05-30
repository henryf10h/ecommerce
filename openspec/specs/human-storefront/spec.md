# Human Storefront Specification

## Purpose

Human-facing storefront with OnchainKit — products, cart, mock Coinbase Commerce checkout on Base. Replaces the placeholder scaffold in `@app/web`.

## Requirements

### Requirement: OnchainKit Provider Setup

The `@app/web` layout MUST wrap all routes in `OnchainProviders` composing Wagmi, QueryClient, and OnchainKitProvider configured for Base mainnet.

#### Scenario: Layout provides chain context

- GIVEN the root layout of `@app/web`
- WHEN rendering any page
- THEN `<OnchainProviders>` SHALL be the outermost provider wrapping `<body>`
- AND it SHALL support Base mainnet via `@coinbase/onchainkit`

### Requirement: Store Product Rendering

The store page (`GET /`) MUST render a grid of products, each showing an image, name, price, and quantity input.

#### Scenario: Default store shows all products

- GIVEN a fresh render of `GET /`
- WHEN the page loads
- THEN the user SHALL see at least 4 products with images and prices
- AND each product SHALL have a quantity input defaulting to 0
- AND each product SHALL have increment/decrement buttons

#### Scenario: Quantity cannot go negative

- GIVEN a product with quantity 0
- WHEN the user clicks decrement
- THEN the quantity SHALL remain 0

### Requirement: Cart State

The app MUST maintain cart state via `OnchainStoreProvider` — a React Context tracking quantities per product, total item count, and total price.

#### Scenario: Cart reflects quantities

- GIVEN products with quantities 2, 1, 0
- WHEN inspecting cart state
- THEN total item count SHALL be 3
- AND total price SHALL be `2 * priceA + 1 * priceB`

### Requirement: Cart Bottom Bar

The app MUST render a sticky bottom bar showing cart items, total, and a checkout button.

#### Scenario: Empty cart hides bar

- GIVEN all quantities at 0
- WHEN the store renders
- THEN the bottom bar SHALL NOT be visible

#### Scenario: Non-empty cart shows bar

- GIVEN at least one product with quantity > 0
- WHEN the store renders
- THEN the bottom bar SHALL be visible
- AND it SHALL display total item count and total price in USDC

### Requirement: Mock Checkout Modal

The app MUST show a mock checkout modal when the user clicks "Checkout" in the cart bar. The modal SHALL display order summary and mock details without executing a real charge.

#### Scenario: Checkout opens modal

- GIVEN a non-empty cart
- WHEN the user clicks "Checkout"
- THEN a modal SHALL open showing order items, total, and mock confirmation

#### Scenario: Modal closes

- GIVEN the checkout modal is open
- WHEN the user clicks close or backdrop
- THEN the modal SHALL close
- AND cart state SHALL reset to all zeros

### Requirement: API Charges Endpoint

The app MUST expose `POST /api/charges` that creates and returns a charge object.

#### Scenario: POST /api/charges succeeds

- GIVEN a valid charge request body
- WHEN POSTing to `/api/charges`
- THEN the response SHALL have status 200
- AND the body SHALL include a charge ID

### Requirement: Core Integration

The storefront MUST import and display `VERSION` from `@app/core` to verify cross-package linking.

#### Scenario: VERSION renders

- GIVEN any store page
- WHEN the page renders
- THEN it SHALL display a version string from `@app/core`

### Requirement: Navigation

The app MUST render a responsive Navbar with navigation links.

#### Scenario: Navbar renders with links

- GIVEN any page
- WHEN the page renders
- THEN the Navbar SHALL display a logo, store link, and optional navigation items
- AND on mobile, the Navbar SHALL collapse into a hamburger menu
