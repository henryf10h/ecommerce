import { describe, expect, it } from 'vitest';
import { PricingService } from './PricingService.js';
import { Money } from '../../domain/value-objects/Money.js';

describe('PricingService', () => {
  it('calculates total from items', () => {
    const total = PricingService.calculateTotal([
      { unitPrice: new Money(4000000n), quantity: 2 },
      { unitPrice: new Money(2000000n), quantity: 3 },
    ]);
    // 2 * 4 + 3 * 2 = 14 USDC
    expect(total.amount).toBe(14000000n);
  });

  it('returns zero for empty items', () => {
    const total = PricingService.calculateTotal([]);
    expect(total.amount).toBe(0n);
  });

  it('handles single item', () => {
    const total = PricingService.calculateTotal([
      { unitPrice: new Money(1500000n), quantity: 1 },
    ]);
    expect(total.amount).toBe(1500000n);
  });
});
