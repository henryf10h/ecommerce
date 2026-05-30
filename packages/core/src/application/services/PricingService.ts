import { Money } from '../../domain/value-objects/Money.js';

type PricedItem = {
  unitPrice: Money;
  quantity: number;
};

export const PricingService = {
  calculateTotal(items: PricedItem[]): Money {
    return items.reduce(
      (sum, item) => sum.add(new Money(item.unitPrice.amount * BigInt(item.quantity))),
      new Money(0n),
    );
  },
};
