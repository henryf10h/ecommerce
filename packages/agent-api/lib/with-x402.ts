import { paymentMiddleware } from 'x402-next';
import { facilitator } from '@coinbase/x402';
import { env } from './env';
import { getOrCreateSellerAccount } from './accounts';
import type { NextRequest } from 'next/server';

type X402Guard = (request: NextRequest) => Promise<Response | null>;

let guard: X402Guard | null = null;

async function getGuard(): Promise<X402Guard> {
  if (guard) return guard;

  const sellerAccount = await getOrCreateSellerAccount();

  const mw = paymentMiddleware(
    sellerAccount.address,
    {
      '/api/quote': {
        price: '$0.005',
        network: env.NETWORK,
        config: {
          description: 'Product quote — agent API access',
        },
      },
    },
    facilitator,
  );

  guard = async (request: NextRequest): Promise<Response | null> => {
    const res = await mw(request);
    // x402-next returns NextResponse.next() (200 empty) on pass-through
    // and 402/error on payment-required/failure
    if (res.status === 200 && !res.headers.get('content-type')) {
      return null; // passed through — run the actual handler
    }
    return res; // 402 or error
  };

  return guard;
}

/**
 * Wraps a route handler with x402 payment protection.
 * If payment is required/missing, returns 402.
 * If payment is valid, runs the actual handler.
 */
export function withX402(
  handler: (request: NextRequest) => Promise<Response>,
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest): Promise<Response> => {
    const guardFn = await getGuard();
    const guardResult = await guardFn(request);
    if (guardResult) return guardResult;
    return handler(request);
  };
}
