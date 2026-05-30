import { getQuoteProduct } from '../../../lib/products';

export function GET(): Response {
  const product = getQuoteProduct();

  return Response.json({
    id: product.id,
    name: product.name,
    price: {
      amount: product.price.amount.toString(),
    },
  });
}
