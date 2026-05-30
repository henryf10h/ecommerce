import { describe, expect, it } from 'vitest';
import { OrderService } from './OrderService.js';
import { Money } from '../../domain/value-objects/Money.js';
import { ProductId } from '../../domain/value-objects/ids.js';
import { LineItem } from '../../domain/entities/Order.js';

describe('OrderService', () => {
  it('creates an order and emits OrderPlaced event', () => {
    const items = [
      new LineItem(ProductId('prod-1'), 2, new Money(4000000n)),
    ];

    const { order, event } = OrderService.createOrder(items);

    expect(order.status).toBe('pending');
    expect(order.items).toHaveLength(1);
    expect(order.total.amount).toBe(8000000n);

    expect(event.type).toBe('order-placed');
    expect(event.orderId).toBe(order.id);
    expect(event.total.amount).toBe(8000000n);
  });

  it('creates orders with different items', () => {
    const items = [
      new LineItem(ProductId('prod-1'), 1, new Money(1000000n)),
      new LineItem(ProductId('prod-2'), 2, new Money(500000n)),
    ];

    const { order, event } = OrderService.createOrder(items);

    // 1 * 1 + 2 * 0.5 = 2 USDC
    expect(order.total.amount).toBe(2000000n);
    expect(event.total.amount).toBe(2000000n);
  });
});
