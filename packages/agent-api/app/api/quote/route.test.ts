import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('GET /api/quote', () => {
  it('returns 200 with product id, name, and price', async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('price');
    expect(body.price).toHaveProperty('amount');
  });

  it('price amount is a string representation of bigint', async () => {
    const res = await GET();
    const body = await res.json();

    expect(body.price.amount).toEqual(expect.any(String));
    expect(BigInt(body.price.amount)).toBeGreaterThan(0n);
  });

  it('name is non-empty', async () => {
    const res = await GET();
    const body = await res.json();

    expect(body.name).toEqual(expect.any(String));
    expect(body.name.length).toBeGreaterThan(0);
  });
});
