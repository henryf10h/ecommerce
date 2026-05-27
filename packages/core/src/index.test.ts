import { describe, expect, it } from 'vitest';
import { VERSION } from './index.js';

describe('@app/core', () => {
  it('exposes a VERSION constant', () => {
    expect(VERSION).toBe('0.0.0');
  });
});
