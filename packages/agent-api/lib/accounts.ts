import { toAccount } from 'viem/accounts';
import type { Account } from 'viem/accounts';
import { CdpClient } from '@coinbase/cdp-sdk';
import { base, baseSepolia } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import { env } from './env';

let cdp: CdpClient | null = null;

function getCdpClient(): CdpClient {
  if (!cdp) {
    cdp = new CdpClient({
      apiKeyId: env.CDP_API_KEY_ID,
      apiKeySecret: env.CDP_API_KEY_SECRET,
      walletSecret: env.CDP_WALLET_SECRET,
    });
  }
  return cdp;
}

const chainMap = {
  'base-sepolia': baseSepolia,
  base,
} as const;

export function getChain() {
  return chainMap[env.NETWORK];
}

function getPublicClient() {
  return createPublicClient({
    chain: getChain(),
    transport: http(),
  });
}

export async function getOrCreatePurchaserAccount(): Promise<Account> {
  const cdpClient = getCdpClient();
  const account = await cdpClient.evm.getOrCreateAccount({
    name: 'Purchaser',
  });
  const balances = await account.listTokenBalances({
    network: env.NETWORK,
  });

  const usdcBalance = balances.balances.find(
    (balance) => balance.token.symbol === 'USDC',
  );

  // if under $0.50 while on testnet, request more
  if (
    env.NETWORK === 'base-sepolia' &&
    (!usdcBalance || Number(usdcBalance.amount) < 500_000)
  ) {
    const { transactionHash } = await cdpClient.evm.requestFaucet({
      address: account.address,
      network: env.NETWORK,
      token: 'usdc',
    });
    const publicClient = getPublicClient();
    const tx = await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
    });
    if (tx.status !== 'success') {
      throw new Error('Failed to receive funds from faucet');
    }
  }

  return toAccount(account);
}

export async function getOrCreateSellerAccount(): Promise<Account> {
  const cdpClient = getCdpClient();
  const account = await cdpClient.evm.getOrCreateAccount({
    name: 'Seller',
  });

  // On testnet, ensure the seller has ETH for gas
  if (env.NETWORK === 'base-sepolia') {
    const publicClient = getPublicClient();
    const ethBalance = await publicClient.getBalance({
      address: account.address as `0x${string}`,
    });

    // Request ETH if below threshold (0.01 ETH ≈ covers many settlements)
    if (ethBalance < 10_000_000_000_000_000n) {
      const { transactionHash } = await cdpClient.evm.requestFaucet({
        address: account.address,
        network: env.NETWORK,
        token: 'eth',
      });
      const tx = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
      });
      if (tx.status !== 'success') {
        console.warn('[accounts] ETH faucet returned non-success status');
      }
    }
  }

  return toAccount(account);
}
