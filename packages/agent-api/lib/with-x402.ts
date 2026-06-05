/**
 * Route-level x402 payment protection with local verification + settlement.
 *
 * Uses x402-next for route matching and paywall HTML, but replaces the
 * CDP facilitator (which requires a CDP API key with the x402 scope) with
 * local on-chain verification and settlement using viem.
 *
 * This works for any network and does NOT depend on the CDP facilitator.
 * For testnets the settlement is submitted directly on-chain.
 */
import { computeRoutePatterns, findMatchingRoute, processPriceToAtomicAmount, findMatchingPaymentRequirements, toJsonSafe } from 'x402/shared';
import { SupportedEVMNetworks } from 'x402/types';
import { getPaywallHtml, safeBase64Encode } from 'x402/shared';
import { type NextRequest, NextResponse } from 'next/server';
import { getAddress, createPublicClient, http, parseErc6492Signature, type Account } from 'viem';
import { baseSepolia, base } from 'viem/chains';
import { env } from './env';
import { getOrCreateSellerAccount } from './accounts';

// ── Constants ──────────────────────────────────────────────────────────────

const USDC_CONFIG: Record<string, { address: string; name: string }> = {
  '84532': { address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', name: 'USDC' },
  '8453': { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', name: 'USD Coin' },
};

const CHAIN_MAP: Record<string, typeof baseSepolia> = {
  'base-sepolia': baseSepolia,
  base,
};

const CHAIN_ID_MAP: Record<string, number> = {
  'base-sepolia': 84532,
  base: 8453,
};

// EIP-3009 TransferWithAuthorization typed data definition
const authorizationTypes = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;

// Minimal USDC ABI — only what we need
const usdcAbi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
      { name: 'signature', type: 'bytes' },
    ],
    name: 'transferWithAuthorization',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// ── Types ──────────────────────────────────────────────────────────────────

interface PaymentHeader {
  x402Version: number;
  scheme: string;
  network: string;
  payload: {
    signature: string;
    authorization: {
      from: string;
      to: string;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: string;
    };
  };
}

interface PaymentRequirements {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  outputSchema?: Record<string, unknown>;
  extra?: Record<string, unknown>;
}

interface RouteConfig {
  price: string | number;
  network: string;
  config?: {
    description?: string;
    mimeType?: string;
    maxTimeoutSeconds?: number;
    inputSchema?: Record<string, unknown>;
    outputSchema?: Record<string, unknown>;
    customPaywallHtml?: string;
    resource?: string;
    errorMessages?: Record<string, string>;
    discoverable?: boolean;
  };
}

type Routes = Record<string, string | number | RouteConfig>;

// ── Helpers ────────────────────────────────────────────────────────────────

function getChain(network: string) {
  const chain = CHAIN_MAP[network];
  if (!chain) throw new Error(`Unsupported network: ${network}`);
  return chain;
}

function getUsdcAddress(network: string): string {
  const chainId = CHAIN_ID_MAP[network];
  const config = USDC_CONFIG[String(chainId)];
  if (!config) throw new Error(`No USDC config for network: ${network}`);
  return config.address;
}

function decodePaymentHeader(header: string): PaymentHeader {
  const decoded = Buffer.from(header, 'base64').toString('utf-8');
  return JSON.parse(decoded);
}

function getPublicClient(network: string) {
  return createPublicClient({
    chain: getChain(network),
    transport: http(),
  });
}

// ── Local verification ─────────────────────────────────────────────────────

async function verifyPayment(
  payment: PaymentHeader,
  sellerAddress: string,
): Promise<{ isValid: boolean; reason?: string }> {
  const auth = payment.payload.authorization;
  const now = Math.floor(Date.now() / 1000);

  // 1. Check scheme & network
  if (payment.scheme !== 'exact') {
    return { isValid: false, reason: 'unsupported_scheme' };
  }
  if (!SupportedEVMNetworks.includes(payment.network)) {
    return { isValid: false, reason: 'invalid_network' };
  }

  // 2. Check recipient matches seller
  if (getAddress(auth.to) !== getAddress(sellerAddress)) {
    return { isValid: false, reason: 'invalid_exact_evm_payload_recipient_mismatch' };
  }

  // 3. Check timestamps
  if (BigInt(auth.validBefore) <= BigInt(now)) {
    return { isValid: false, reason: 'invalid_exact_evm_payload_authorization_valid_before' };
  }
  if (BigInt(auth.validAfter) > BigInt(now)) {
    return { isValid: false, reason: 'invalid_exact_evm_payload_authorization_valid_after' };
  }

  // 4. Recover signer from typed data signature
  const chainId = CHAIN_ID_MAP[payment.network];
  const usdcAddress = getUsdcAddress(payment.network);
  const usdcConfig = USDC_CONFIG[String(chainId)];

  const domain = {
    name: usdcConfig.name,
    version: '2',
    chainId,
    verifyingContract: getAddress(usdcAddress),
  };

  const message = {
    from: getAddress(auth.from),
    to: getAddress(auth.to),
    value: BigInt(auth.value),
    validAfter: BigInt(auth.validAfter),
    validBefore: BigInt(auth.validBefore),
    nonce: auth.nonce as `0x${string}`,
  };

  const signature = payment.payload.signature as `0x${string}`;

  try {
    const publicClient = getPublicClient(payment.network);
    const recovered = await publicClient.verifyTypedData({
      address: getAddress(auth.from) as `0x${string}`,
      domain,
      types: authorizationTypes,
      primaryType: 'TransferWithAuthorization',
      message,
      signature,
    });

    if (!recovered) {
      return { isValid: false, reason: 'invalid_exact_evm_payload_signature' };
    }
  } catch (err) {
    console.error('[x402] Signature verification error:', err);
    return { isValid: false, reason: 'unexpected_verify_error' };
  }

  // 5. Check USDC balance
  try {
    const publicClient = getPublicClient(payment.network);
    const balance = (await publicClient.readContract({
      address: getAddress(usdcAddress),
      abi: usdcAbi,
      functionName: 'balanceOf',
      args: [getAddress(auth.from)],
    })) as bigint;

    if (balance < BigInt(auth.value)) {
      return { isValid: false, reason: 'insufficient_funds' };
    }
  } catch (err) {
    console.error('[x402] Balance check error:', err);
    return { isValid: false, reason: 'unexpected_verify_error' };
  }

  return { isValid: true };
}

// ── Local settlement ───────────────────────────────────────────────────────

async function settlePayment(
  payment: PaymentHeader,
): Promise<{ success: boolean; transaction?: string; error?: string }> {
  const auth = payment.payload.authorization;
  const signature = payment.payload.signature as `0x${string}`;

  try {
    // Parse ERC-6492 wrapper if present (smart contract wallets)
    let rawSignature: `0x${string}`;
    try {
      const parsed = parseErc6492Signature(signature);
      rawSignature = parsed.signature;
    } catch {
      rawSignature = signature;
    }

    const publicClient = getPublicClient(payment.network);
    const usdcAddress = getUsdcAddress(payment.network);

    // Use the seller account (CDP server-signer) as the transaction sender.
    // Anyone can call transferWithAuthorization — the sender just pays gas.
    const sellerAccount = await getOrCreateSellerAccount();

    const { createWalletClient } = await import('viem');
    const walletClient = createWalletClient({
      account: sellerAccount,
      chain: getChain(payment.network),
      transport: http(),
    });

    const txHash = await walletClient.writeContract({
      address: getAddress(usdcAddress),
      abi: usdcAbi,
      functionName: 'transferWithAuthorization',
      args: [
        getAddress(auth.from),
        getAddress(auth.to),
        BigInt(auth.value),
        BigInt(auth.validAfter),
        BigInt(auth.validBefore),
        auth.nonce as `0x${string}`,
        rawSignature,
      ],
    });

    console.log(`[x402] ✅ Settlement on-chain: ${txHash}`);
    return { success: true, transaction: txHash };
  } catch (err) {
    console.warn('[x402] Settlement error (non-fatal for simulation):', err);
    return { success: false, error: String(err) };
  }
}

// ── Build payment requirements ─────────────────────────────────────────────

function buildPaymentRequirements(
  routeConfig: RouteConfig,
  resourceUrl: string,
  sellerAddress: string,
): PaymentRequirements[] {
  const result = processPriceToAtomicAmount(routeConfig.price, routeConfig.network);
  if ('error' in result) {
    throw new Error(result.error);
  }

  const { maxAmountRequired, asset } = result;

  return [
    {
      scheme: 'exact',
      network: routeConfig.network,
      maxAmountRequired,
      resource: resourceUrl,
      description: routeConfig.config?.description ?? '',
      mimeType: routeConfig.config?.mimeType ?? 'application/json',
      payTo: getAddress(sellerAddress),
      maxTimeoutSeconds: routeConfig.config?.maxTimeoutSeconds ?? 300,
      asset: getAddress(asset.address),
      outputSchema: {
        input: {
          type: 'http',
          method: 'GET',
          discoverable: routeConfig.config?.discoverable ?? true,
          ...routeConfig.config?.inputSchema,
        },
        output: routeConfig.config?.outputSchema,
      },
      extra: asset.eip712,
    },
  ];
}

// ── Middleware factory ──────────────────────────────────────────────────────

type X402Guard = (request: NextRequest) => Promise<Response | null>;

let guard: X402Guard | null = null;

async function getGuard(): Promise<X402Guard> {
  if (guard) return guard;

  const sellerAccount = await getOrCreateSellerAccount();
  const sellerAddress = sellerAccount.address;

  // Route definitions (same as before)
  const routes: Routes = {
    '/api/quote': {
      price: '$0.005',
      network: env.NETWORK,
      config: {
        description: 'Product quote — agent API access',
      },
    },
  };

  const routePatterns = computeRoutePatterns(routes);
  const x402Version = 1;

  guard = async (request: NextRequest): Promise<Response | null> => {
    const pathname = request.nextUrl.pathname;
    const method = request.method.toUpperCase();
    const matchingRoute = findMatchingRoute(routePatterns, pathname, method);

    if (!matchingRoute) {
      return null; // not a protected route
    }

    const resourceUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}${pathname}`;
    const paymentRequirements = buildPaymentRequirements(
      matchingRoute.config,
      resourceUrl,
      sellerAddress,
    );

    // ── No payment header → return 402 ──────────────────────
    const paymentHeader = request.headers.get('X-PAYMENT');
    if (!paymentHeader) {
      const accept = request.headers.get('Accept');
      if (accept?.includes('text/html') && request.headers.get('User-Agent')?.includes('Mozilla')) {
        // Browser paywall
        const html = getPaywallHtml({
          amount: matchingRoute.config.price,
          paymentRequirements: toJsonSafe(paymentRequirements),
          currentUrl: request.url,
          testnet: env.NETWORK === 'base-sepolia',
        });
        return new NextResponse(html, {
          status: 402,
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // API 402 response
      return NextResponse.json(
        {
          x402Version,
          error: 'X-PAYMENT header is required',
          accepts: paymentRequirements,
        },
        { status: 402 },
      );
    }

    // ── Decode payment header ────────────────────────────────
    let decodedPayment: PaymentHeader;
    try {
      decodedPayment = decodePaymentHeader(paymentHeader);
      decodedPayment.x402Version = x402Version;
    } catch {
      return NextResponse.json(
        {
          x402Version,
          error: 'Invalid payment',
          accepts: paymentRequirements,
        },
        { status: 402 },
      );
    }

    // Find matching requirements
    const selectedRequirements = findMatchingPaymentRequirements(
      paymentRequirements,
      decodedPayment,
    );
    if (!selectedRequirements) {
      return NextResponse.json(
        {
          x402Version,
          error: 'Unable to find matching payment requirements',
          accepts: toJsonSafe(paymentRequirements),
        },
        { status: 402 },
      );
    }

    // ── Verify payment locally ───────────────────────────────
    const verification = await verifyPayment(decodedPayment, sellerAddress);
    if (!verification.isValid) {
      return NextResponse.json(
        {
          x402Version,
          error: verification.reason,
          accepts: paymentRequirements,
          payer: decodedPayment.payload.authorization.from,
        },
        { status: 402 },
      );
    }

    // Verification passed — return null so the handler runs.
    // Settlement happens AFTER the handler returns (see withX402 below).
    return null;
  };

  return guard;
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Wraps a route handler with x402 payment protection using LOCAL
 * on-chain verification (no CDP facilitator dependency).
 *
 * If payment is required/missing, returns 402.
 * If payment is valid, runs the actual handler and settles on-chain.
 */
export function withX402(
  handler: (request: NextRequest) => Promise<Response>,
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest): Promise<Response> => {
    const guardFn = await getGuard();
    const guardResult = await guardFn(request);
    if (guardResult) return guardResult;

    // Run the actual handler
    const handlerResponse = await handler(request);

    // If successful, try to settle the payment on-chain
    if (handlerResponse.status >= 200 && handlerResponse.status < 300) {
      const paymentHeader = request.headers.get('X-PAYMENT');
      if (paymentHeader) {
        try {
          const decodedPayment = decodePaymentHeader(paymentHeader);
          const settlement = await settlePayment(decodedPayment);
          if (settlement.success) {
            // Add settlement info to response header
            const newHeaders = new Headers(handlerResponse.headers);
            newHeaders.set(
              'X-PAYMENT-RESPONSE',
              safeBase64Encode(
                JSON.stringify({
                  success: true,
                  transaction: settlement.transaction,
                  network: decodedPayment.network,
                  payer: decodedPayment.payload.authorization.from,
                }),
              ),
            );
            return new NextResponse(handlerResponse.body, {
              status: handlerResponse.status,
              statusText: handlerResponse.statusText,
              headers: newHeaders,
            });
          }
          console.warn('[x402] Settlement did not succeed:', settlement.error);
        } catch (err) {
          console.warn('[x402] Settlement error (non-fatal):', err);
        }
      }
    }

    return handlerResponse;
  };
}
