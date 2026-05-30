import { describe, expect, it } from 'vitest';
import { Payment, Settlement } from './Payment.js';
import { Money } from '../value-objects/Money.js';
import { OrderId, PaymentId } from '../value-objects/ids.js';

const orderId = OrderId('order-1');
const paymentId = PaymentId('pay-1');

describe('Payment', () => {
  it('creates a payment with pending status', () => {
    const payment = new Payment(paymentId, orderId, new Money(1000000n));
    expect(payment.id).toBe('pay-1');
    expect(payment.orderId).toBe('order-1');
    expect(payment.amount.amount).toBe(1000000n);
    expect(payment.status).toBe('pending');
  });

  it('transitions to completed when settled', () => {
    const payment = new Payment(paymentId, orderId, new Money(1000000n));
    const settled = payment.complete('0x123');
    expect(settled.status).toBe('completed');
    expect(settled.transactionHash).toBe('0x123');
    expect(payment.status).toBe('pending'); // original unchanged
  });

  it('transitions to failed', () => {
    const payment = new Payment(paymentId, orderId, new Money(1000000n));
    const failed = payment.fail();
    expect(failed.status).toBe('failed');
  });

  it('rejects transition from completed to failed', () => {
    const payment = new Payment(paymentId, orderId, new Money(1000000n));
    const settled = payment.complete('0x123');
    expect(() => settled.fail()).toThrow('Cannot transition');
  });
});

describe('Settlement', () => {
  it('records an on-chain settlement', () => {
    const settlement = new Settlement(paymentId, new Money(1000000n), '0xabc');
    expect(settlement.paymentId).toBe('pay-1');
    expect(settlement.amount.amount).toBe(1000000n);
    expect(settlement.transactionHash).toBe('0xabc');
    expect(settlement.status).toBe('completed');
    expect(settlement.timestamp).toBeInstanceOf(Date);
  });
});
