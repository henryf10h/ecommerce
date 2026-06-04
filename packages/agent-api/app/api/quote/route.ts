import type { NextRequest } from 'next/server';
import { getQuoteProduct } from '../../../lib/products';
import { withX402 } from '../../../lib/with-x402';

export async function quoteHandler(): Promise<Response> {
  const product = getQuoteProduct();

  return Response.json({
    id: product.id,
    name: product.name,
    price: {
      amount: product.price.amount.toString(),
    },
  });
}

export const GET = withX402(async (_request: NextRequest) => quoteHandler());
