import { describe, expect, it } from 'vitest';

describe('Branded IDs', () => {
  it('ProductId, OrderId, PaymentId are type-level only (runtime = string)', async () => {
    // Dynamic import to verify the module exports exist
    const mod = await import('./ids.js');
    const { ProductId, OrderId, PaymentId } = mod;

    // Runtime: branded types are strings with no runtime overhead
    const pid: string = ProductId('prod-123');
    expect(pid).toBe('prod-123');

    const oid: string = OrderId('order-456');
    expect(oid).toBe('order-456');

    const payid: string = PaymentId('pay-789');
    expect(payid).toBe('pay-789');
  });

  it('different ID types are distinguishable at type level only', async () => {
    const mod = await import('./ids.js');
    const { ProductId, OrderId } = mod;

    const pid = ProductId('prod-1');
    const oid = OrderId('order-1');

    // At runtime, both are strings
    expect(typeof pid).toBe('string');
    expect(typeof oid).toBe('string');

    // TypeScript prevents mixing them at compile time (tested via typecheck)
    // Runtime: they are plain strings with no overhead
  });
});
