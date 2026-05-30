import { Money, Product } from '@app/core';
import type { ProductId } from '@app/core';

const AGENT_ACCESS_PRODUCT: Product = new Product(
  'prod-agent-access' as ProductId,
  'Agent API Access',
  Money.fromString('0.005'),
  '',
);

export function getQuoteProduct(): Product {
  return AGENT_ACCESS_PRODUCT;
}
