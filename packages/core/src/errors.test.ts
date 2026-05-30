import { describe, expect, it } from 'vitest';
import { ValidationError, NotFoundError, InsufficientFundsError } from './errors.js';

describe('Domain Errors', () => {
  describe('ValidationError', () => {
    it('creates a validation error with message and optional field', () => {
      const err = ValidationError('Name is required', 'name');
      expect(err.type).toBe('validation');
      expect(err.message).toBe('Name is required');
      expect(err.field).toBe('name');
    });

    it('creates a validation error without field', () => {
      const err = ValidationError('Invalid input');
      expect(err.type).toBe('validation');
      expect(err.message).toBe('Invalid input');
      expect(err.field).toBeUndefined();
    });
  });

  describe('NotFoundError', () => {
    it('creates a not-found error with entity name and id', () => {
      const err = NotFoundError('Product', 'prod-123');
      expect(err.type).toBe('not-found');
      expect(err.message).toContain('Product');
      expect(err.message).toContain('prod-123');
      expect(err.entity).toBe('Product');
      expect(err.id).toBe('prod-123');
    });
  });

  describe('InsufficientFundsError', () => {
    it('creates an error with balance and required amounts', () => {
      const err = InsufficientFundsError(500000n, 1000000n);
      expect(err.type).toBe('insufficient-funds');
      expect(err.message).toContain('0.5 USDC');
      expect(err.message).toContain('1 USDC');
      expect(err.balance).toBe(500000n);
      expect(err.required).toBe(1000000n);
    });

    it('handles zero and large values', () => {
      const err = InsufficientFundsError(0n, 100000000n);
      expect(err.type).toBe('insufficient-funds');
      expect(err.balance).toBe(0n);
      expect(err.required).toBe(100000000n);
      expect(err.message).toContain('0 USDC');
      expect(err.message).toContain('100 USDC');
    });
  });
});
