import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { paymentMiddleware } from 'x402-next';
import { facilitator } from '@coinbase/x402';
import { env } from './lib/env';
import { getOrCreateSellerAccount } from './lib/accounts';
import { checkIsScraper } from './lib/bot-detection';

const network = env.NETWORK;

type X402Handler = (request: NextRequest) => Promise<NextResponse<unknown>>;

let x402Middleware: X402Handler | null = null;

async function getX402Middleware(): Promise<X402Handler> {
  if (!x402Middleware) {
    const sellerAccount = await getOrCreateSellerAccount();
    x402Middleware = paymentMiddleware(
      sellerAccount.address,
      {
        '/api/quote': {
          price: '$0.005',
          network,
          config: {
            description: 'Product quote — agent API access',
          },
        },
      },
      facilitator,
    );
  }
  return x402Middleware;
}

export async function middleware(request: NextRequest): Promise<NextResponse | Response> {
  if (request.nextUrl.pathname.startsWith('/api') || checkIsScraper(request)) {
    const mw = await getX402Middleware();
    return mw(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
  runtime: 'nodejs',
};
