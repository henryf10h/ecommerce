export const COINBASE_COMMERCE_API_KEY =
  process.env.COINBASE_COMMERCE_API_KEY || '';
export const NEXT_PUBLIC_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://commerce-x402.vercel.app';
export const NEXT_PUBLIC_ONCHAINKIT_API_KEY =
  process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '';
