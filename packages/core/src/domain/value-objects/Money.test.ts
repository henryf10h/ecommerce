import { describe, expect, it } from 'vitest';
import { Money } from './Money.js';

describe('Money', () => {
  describe('creation', () => {
    it('creates Money from bigint cents', () => {
      const money = new Money(1000000n);
      expect(money.amount).toBe(1000000n);
      expect(money.toDisplay()).toBe('1.00');
    });

    it('rejects negative values', () => {
      expect(() => new Money(-100n)).toThrow('negative');
    });
  });

  describe('arithmetic', () => {
    it('adds two Money amounts', () => {
      const a = new Money(500000n);
      const b = new Money(250000n);
      const result = a.add(b);
      expect(result.amount).toBe(750000n);
    });

    it('subtracts two Money amounts', () => {
      const a = new Money(500000n);
      const b = new Money(250000n);
      const result = a.subtract(b);
      expect(result.amount).toBe(250000n);
    });

    it('throws when subtracting more than balance', () => {
      const a = new Money(100000n);
      const b = new Money(500000n);
      expect(() => a.subtract(b)).toThrow('Insufficient');
    });
  });

  describe('comparison', () => {
    it('compares greater than', () => {
      const a = new Money(1000000n);
      const b = new Money(2000000n);
      expect(a.isGreaterThan(b)).toBe(false);
      expect(b.isGreaterThan(a)).toBe(true);
    });

    it('compares less than', () => {
      const a = new Money(1000000n);
      const b = new Money(2000000n);
      expect(a.isLessThan(b)).toBe(true);
      expect(b.isLessThan(a)).toBe(false);
    });

    it('checks equality', () => {
      const a = new Money(1000000n);
      const b = new Money(1000000n);
      const c = new Money(2000000n);
      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });
  });

  describe('serialization', () => {
    it('converts to display format', () => {
      expect(new Money(0n).toDisplay()).toBe('0.00');
      expect(new Money(1n).toDisplay()).toBe('0.000001');
      expect(new Money(1000000n).toDisplay()).toBe('1.00');
      expect(new Money(1500000n).toDisplay()).toBe('1.50');
      expect(new Money(100000000n).toDisplay()).toBe('100.00');
    });
  });

  describe('fromString', () => {
    it('creates Money from decimal string', () => {
      const money = Money.fromString('1.00');
      expect(money.amount).toBe(1000000n);
    });

    it('creates Money from integer string', () => {
      const money = Money.fromString('5');
      expect(money.amount).toBe(5000000n);
    });

    it('creates Money from zero', () => {
      const money = Money.fromString('0');
      expect(money.amount).toBe(0n);
    });
  });
});
