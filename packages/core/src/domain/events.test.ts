import { describe, expect, it } from 'vitest';
import { OrderPlaced, PaymentConfirmed } from './events.js';
import { Money } from './value-objects/Money.js';
import { OrderId, PaymentId } from './value-objects/ids.js';

describe('Domain Events', () => {
  describe('OrderPlaced', () => {
    it('creates an OrderPlaced event', () => {
      const event = new OrderPlaced(
        OrderId('order-1'),
        new Money(5000000n),
      );

      expect(event.type).toBe('order-placed');
      expect(event.orderId).toBe('order-1');
      expect(event.total.amount).toBe(5000000n);
      expect(event.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('PaymentConfirmed', () => {
    it('creates a PaymentConfirmed event', () => {
      const event = new PaymentConfirmed(
        PaymentId('pay-1'),
        OrderId('order-1'),
        new Money(5000000n),
        '0xabc123',
      );

      expect(event.type).toBe('payment-confirmed');
      expect(event.paymentId).toBe('pay-1');
      expect(event.orderId).toBe('order-1');
      expect(event.amount.amount).toBe(5000000n);
      expect(event.transactionHash).toBe('0xabc123');
      expect(event.timestamp).toBeInstanceOf(Date);
    });
  });
});
