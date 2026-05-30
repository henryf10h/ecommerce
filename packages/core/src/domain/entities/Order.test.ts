import { describe, expect, it } from 'vitest';
import { Order, LineItem } from './Order.js';
import { Money } from '../value-objects/Money.js';
import { OrderId, ProductId } from '../value-objects/ids.js';

const jacketId = ProductId('prod-jacket');
const mugId = ProductId('prod-mug');

const jacketItem = () => new LineItem(jacketId, 2, new Money(4000000n));

function makeOrder() {
  return new Order({
    id: OrderId('order-1'),
    items: [jacketItem()],
  });
}

describe('Order', () => {
  describe('creation', () => {
    it('creates an order with pending status', () => {
      const order = makeOrder();
      expect(order.id).toBe('order-1');
      expect(order.status).toBe('pending');
    });

    it('calculates total from line items', () => {
      const order = new Order({
        id: OrderId('order-2'),
        items: [
          new LineItem(jacketId, 2, new Money(4000000n)),
          new LineItem(mugId, 3, new Money(2000000n)),
        ],
      });
      // 2 * 4 + 3 * 2 = 14 USDC
      expect(order.total.amount).toBe(14000000n);
    });

    it('rejects empty items', () => {
      expect(() => new Order({
        id: OrderId('order-3'),
        items: [],
      })).toThrow('must have at least one item');
    });
  });

  describe('status lifecycle', () => {
    it('transitions from pending to confirmed', () => {
      const order = makeOrder();
      const confirmed = order.confirm();
      expect(confirmed.status).toBe('confirmed');
      expect(order.status).toBe('pending'); // original unchanged
    });

    it('transitions from confirmed to completed', () => {
      const order = makeOrder().confirm();
      const completed = order.complete();
      expect(completed.status).toBe('completed');
    });

    it('transitions from pending to cancelled', () => {
      const order = makeOrder();
      const cancelled = order.cancel();
      expect(cancelled.status).toBe('cancelled');
    });

    it('rejects invalid transition: confirmed → cancelled', () => {
      const order = makeOrder().confirm();
      expect(() => order.cancel()).toThrow('Cannot transition from');
    });

    it('rejects invalid transition: completed → cancel', () => {
      const order = makeOrder().confirm().complete();
      expect(() => order.cancel()).toThrow('Cannot transition from');
    });

    it('rejects invalid transition: cancelled → confirm', () => {
      const order = makeOrder().cancel();
      expect(() => order.confirm()).toThrow('Cannot transition from');
    });
  });

  describe('LineItem', () => {
    it('calculates item total from quantity * unitPrice', () => {
      const item = new LineItem(jacketId, 3, new Money(4000000n));
      expect(item.total.amount).toBe(12000000n);
    });

    it('rejects zero quantity', () => {
      expect(() => new LineItem(jacketId, 0, new Money(4000000n)))
        .toThrow('Quantity must be positive');
    });
  });
});
