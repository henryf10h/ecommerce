# x402 Payments Specification

## Purpose

x402 payment protocol integration in `@app/agent-api`. Agents (AI, bots, services) pay USDC via HTTP 402 to access endpoints. Built on Coinbase CDP server wallets + x402-next middleware.

## Requirements

### Requirement: Environment Validation

The agent-api MUST validate required CDP environment variables at runtime using `@t3-oss/env-nextjs` with Zod schemas.

#### Scenario: Missing env vars fail gracefully

- GIVEN a build without `CDP_API_KEY_ID`, `CDP_API_KEY_SECRET`, or `CDP_WALLET_SECRET`
- WHEN running `next build`
- THEN the build SHOULD NOT fail (skipValidation enabled)
- AND the env validation SHALL throw at runtime when the vars are accessed

#### Scenario: Default network is testnet

- GIVEN no `NETWORK` env var
- WHEN validating env
- THEN `NETWORK` SHALL default to `"base-sepolia"`

### Requirement: CDP Wallet Management

The agent-api MUST manage two server wallets via `@coinbase/cdp-sdk`: Purchaser (pays for tools) and Seller (receives payments).

#### Scenario: Seller account is created

- GIVEN valid CDP credentials
- WHEN `getOrCreateSellerAccount()` is called
- THEN it SHALL return a viem `Account` derived from the CDP server wallet named "Seller"

#### Scenario: Purchaser account requests faucet on testnet

- GIVEN a Purchaser account on `base-sepolia` with USDC balance < $0.50
- WHEN `getOrCreatePurchaserAccount()` is called
- THEN it SHALL request USDC from the CDP faucet
- AND it SHALL wait for the transaction receipt before returning

### Requirement: x402 Payment Middleware

The agent-api MUST use `x402-next` middleware to intercept requests and require USDC payment via HTTP 402.

#### Scenario: API routes require payment

- GIVEN a request to `/api/*` without x402 payment headers
- WHEN the middleware runs
- THEN it SHALL respond with HTTP 402 status
- AND the response SHALL include x402 payment challenge headers

#### Scenario: Humans bypass payment for page routes

- GIVEN a non-bot user-agent requesting a page route
- WHEN the middleware runs
- THEN it SHALL return `NextResponse.next()` without payment challenge

#### Scenario: Bots are paywalled on page routes

- GIVEN a bot/scraper user-agent requesting any route
- WHEN the middleware runs
- THEN it SHALL apply the x402 payment middleware

### Requirement: Paywalled API Endpoint

The agent-api MUST expose `GET /api/quote` that returns a product quote, protected by x402 middleware.

#### Scenario: Quote returns product info

- GIVEN a valid x402 payment for `/api/quote`
- WHEN GETting the endpoint
- THEN it SHALL return 200 with product ID, name, and price in USDC (as bigint, 6 decimals)

#### Scenario: Quote returns 402 without payment

- GIVEN no x402 payment for `/api/quote`
- WHEN GETting the endpoint
- THEN the middleware SHALL return 402 before the handler runs

### Requirement: Domain Integration

The agent-api SHOULD use `@app/core` domain types (Product, Money) for endpoint responses.

#### Scenario: Quote uses domain types

- GIVEN the `GET /api/quote` handler
- WHEN constructing its response
- THEN it SHOULD reference `Product` and `Money` types from `@app/core`

### Requirement: Placeholder Page

The agent-api MUST retain a placeholder page at `/` that imports and displays VERSION from `@app/core`.

#### Scenario: Root page renders version

- GIVEN a request to `GET /`
- WHEN the page renders
- THEN it SHALL display a version string from `@app/core`
