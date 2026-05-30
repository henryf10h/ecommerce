'use client';

import { http, createConfig, type Config } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig: Config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'commerce-x402',
    }),
  ],
  ssr: true,
  transports: {
    [base.id]: http(),
  },
});
