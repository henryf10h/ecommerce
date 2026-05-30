const DECIMALS = 6;

export class Money {
  constructor(readonly amount: bigint) {
    if (amount < 0n) {
      throw new Error(`Amount cannot be negative: ${amount}`);
    }
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  subtract(other: Money): Money {
    if (other.amount > this.amount) {
      throw new Error(`Insufficient funds: ${this.toDisplay()} - ${other.toDisplay()}`);
    }
    return new Money(this.amount - other.amount);
  }

  isGreaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    return this.amount < other.amount;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount;
  }

  toDisplay(): string {
    const divisor = 10n ** BigInt(DECIMALS);
    const whole = this.amount / divisor;
    const fraction = this.amount % divisor;
    const padded = fraction.toString().padStart(DECIMALS, '0');
    const trimmed = padded.replace(/0+$/, '');
    const displayFraction = trimmed.length < 2 ? trimmed.padEnd(2, '0') : trimmed;
    return `${whole.toString()}.${displayFraction}`;
  }

  static fromString(value: string): Money {
    const [whole, fraction = ''] = value.split('.');
    const padded = fraction.padEnd(DECIMALS, '0');
    const amount = BigInt(`${whole}${padded}`);
    return new Money(amount);
  }

  toString(): string {
    return this.amount.toString();
  }
}
