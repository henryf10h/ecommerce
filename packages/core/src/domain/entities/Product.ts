import { Money } from '../value-objects/Money.js';
import type { ProductId } from '../value-objects/ids.js';

export class Product {
  constructor(
    readonly id: ProductId,
    readonly name: string,
    readonly price: Money,
    readonly image: string,
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
    if (price.amount <= 0n) {
      throw new Error('Price must be positive');
    }
  }
}
