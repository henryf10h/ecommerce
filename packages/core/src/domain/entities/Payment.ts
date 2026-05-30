import { Money } from '../value-objects/Money.js';
import type { OrderId, PaymentId } from '../value-objects/ids.js';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ['completed', 'failed'],
  completed: [],
  failed: [],
};

export class Payment {
  constructor(
    readonly id: PaymentId,
    readonly orderId: OrderId,
    readonly amount: Money,
    readonly status: PaymentStatus = 'pending',
    readonly transactionHash?: string,
  ) {}

  complete(txHash: string): Payment {
    if (!PAYMENT_TRANSITIONS[this.status].includes('completed')) {
      throw new Error(`Cannot transition from ${this.status} to completed`);
    }
    return new Payment(this.id, this.orderId, this.amount, 'completed', txHash);
  }

  fail(): Payment {
    if (!PAYMENT_TRANSITIONS[this.status].includes('failed')) {
      throw new Error(`Cannot transition from ${this.status} to failed`);
    }
    return new Payment(this.id, this.orderId, this.amount, 'failed');
  }
}

export class Settlement {
  readonly timestamp: Date;

  constructor(
    readonly paymentId: PaymentId,
    readonly amount: Money,
    readonly transactionHash: string,
    readonly status: 'completed' = 'completed',
  ) {
    this.timestamp = new Date();
  }
}
