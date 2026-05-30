import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { paymentMiddleware } from 'x402-next';
import { facilitator } from '@coinbase/x402';
import { env } from './lib/env';
import { getOrCreateSellerAccount } from './lib/accounts';
import { checkIsScraper } from './lib/bot-detection';

const network = env.NETWORK;
const sellerAccount = await getOrCreateSellerAccount();

export const x402Middleware = paymentMiddleware(
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

export async function middleware(request: NextRequest): Promise<NextResponse | Response> {
  if (request.nextUrl.pathname.startsWith('/api')) {
    return x402Middleware(request);
  }

  if (checkIsScraper(request)) {
    return x402Middleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
  runtime: 'nodejs',
};
