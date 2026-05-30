import { describe, expect, it, afterAll, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

describe('env', () => {
  afterAll(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('NETWORK defaults to base-sepolia when not set', async () => {
    vi.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      CDP_API_KEY_ID: 'test-key-id',
      CDP_API_KEY_SECRET: 'test-key-secret',
      CDP_WALLET_SECRET: 'test-wallet-secret',
    };
    delete process.env.NETWORK;
    delete process.env.SKIP_ENV_VALIDATION;

    const { env } = await import('./env');
    expect(env.NETWORK).toBe('base-sepolia');
  });

  it('allows base mainnet via NETWORK env var', async () => {
    vi.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      CDP_API_KEY_ID: 'test-key-id',
      CDP_API_KEY_SECRET: 'test-key-secret',
      CDP_WALLET_SECRET: 'test-wallet-secret',
      NETWORK: 'base',
    };
    delete process.env.SKIP_ENV_VALIDATION;

    const { env } = await import('./env');
    expect(env.NETWORK).toBe('base');
  });

  it('constructs URL from VERCEL_PROJECT_PRODUCTION_URL', async () => {
    vi.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      CDP_API_KEY_ID: 'test-key-id',
      CDP_API_KEY_SECRET: 'test-key-secret',
      CDP_WALLET_SECRET: 'test-wallet-secret',
      VERCEL_PROJECT_PRODUCTION_URL: 'my-app.vercel.app',
    };
    delete process.env.NETWORK;
    delete process.env.SKIP_ENV_VALIDATION;

    const { env } = await import('./env');
    expect(env.URL).toBe('https://my-app.vercel.app');
  });
});
