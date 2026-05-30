import { Money } from './value-objects/Money.js';
import type { OrderId, PaymentId } from './value-objects/ids.js';

export type DomainEvent =
  | OrderPlaced
  | PaymentConfirmed;

export class OrderPlaced {
  readonly type = 'order-placed' as const;
  readonly timestamp: Date;

  constructor(
    readonly orderId: OrderId,
    readonly total: Money,
  ) {
    this.timestamp = new Date();
  }
}

export class PaymentConfirmed {
  readonly type = 'payment-confirmed' as const;
  readonly timestamp: Date;

  constructor(
    readonly paymentId: PaymentId,
    readonly orderId: OrderId,
    readonly amount: Money,
    readonly transactionHash: string,
  ) {
    this.timestamp = new Date();
  }
}
