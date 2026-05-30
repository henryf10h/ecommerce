import { describe, expect, it } from 'vitest';
import { Product } from './Product.js';
import { Money } from '../value-objects/Money.js';
import { ProductId } from '../value-objects/ids.js';

describe('Product', () => {
  it('creates a product with valid data', () => {
    const product = new Product(
      ProductId('prod-1'),
      "Builder Jacket",
      new Money(4000000n),
      '/images/jacket.png',
    );

    expect(product.id).toBe('prod-1');
    expect(product.name).toBe("Builder Jacket");
    expect(product.price.amount).toBe(4000000n);
    expect(product.image).toBe('/images/jacket.png');
  });

  it('rejects empty name', () => {
    expect(() => new Product(
      ProductId('prod-2'),
      '',
      new Money(1000000n),
      '/images/mug.png',
    )).toThrow('Name cannot be empty');
  });

  it('rejects zero price', () => {
    expect(() => new Product(
      ProductId('prod-3'),
      'Free Item',
      new Money(0n),
      '/images/free.png',
    )).toThrow('Price must be positive');
  });
});
