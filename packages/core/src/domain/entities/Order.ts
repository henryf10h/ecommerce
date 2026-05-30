import { Money } from '../value-objects/Money.js';
import type { OrderId, ProductId } from '../value-objects/ids.js';

export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed'],
  completed: [],
  cancelled: [],
};

export class LineItem {
  readonly total: Money;

  constructor(
    readonly productId: ProductId,
    readonly quantity: number,
    readonly unitPrice: Money,
  ) {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    this.total = new Money(unitPrice.amount * BigInt(quantity));
  }

  // Shorthand constructor for convenience when used with Order builder
  static create(config: {
    productId: ProductId;
    quantity: number;
    unitPrice: Money;
  }): LineItem {
    return new LineItem(config.productId, config.quantity, config.unitPrice);
  }
}

type OrderConfig = {
  id: OrderId;
  items: LineItem[];
  status?: OrderStatus;
};

export class Order {
  readonly id: OrderId;
  readonly items: readonly LineItem[];
  readonly status: OrderStatus;
  readonly total: Money;

  constructor(config: OrderConfig) {
    if (!config.items || config.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    this.id = config.id;
    this.items = config.items;
    this.status = config.status ?? 'pending';
    this.total = config.items.reduce(
      (sum, item) => sum.add(item.total),
      new Money(0n),
    );
  }

  confirm(): Order {
    return this.transitionTo('confirmed');
  }

  complete(): Order {
    return this.transitionTo('completed');
  }

  cancel(): Order {
    return this.transitionTo('cancelled');
  }

  private transitionTo(target: OrderStatus): Order {
    const allowed = VALID_TRANSITIONS[this.status];
    if (!allowed.includes(target)) {
      throw new Error(
        `Cannot transition from ${this.status} to ${target}`,
      );
    }
    return new Order({
      id: this.id,
      items: [...this.items],
      status: target,
    });
  }
}
