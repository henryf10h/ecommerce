import { describe, expect, it } from 'vitest';
import { getQuoteProduct } from './products';

describe('products', () => {
  it('returns a product with id, name, and price', () => {
    const product = getQuoteProduct();

    expect(product.id).toBeDefined();
    expect(typeof product.name).toBe('string');
    expect(product.name.length).toBeGreaterThan(0);
    expect(product.price.amount).toBeGreaterThan(0n);
  });

  it('price is in USDC (6 decimals)', () => {
    const product = getQuoteProduct();

    // price is stored as bigint (6 decimals for USDC)
    const priceStr = product.price.amount.toString();
    expect(priceStr).toMatch(/^\d+$/);
    // price should be reasonable: at least 1000 (0.001 USDC)
    expect(product.price.amount).toBeGreaterThanOrEqual(1000n);
  });
});
