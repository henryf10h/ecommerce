/**
 * Full x402 agent buy simulation
 *
 * 1. Creates/funds a Purchaser wallet via CDP (auto-faucet on testnet)
 * 2. Requests /api/quote without payment → gets 402
 * 3. Creates an x402 payment header using the Purchaser's wallet
 * 4. Retries with payment → gets the quote data
 *
 * Usage:
 *   cd packages/agent-api
 *   npx tsx scripts/simulate-agent-buy.ts
 *
 * Prerequisites:
 *   - Dev server running: pnpm --filter @app/agent-api dev
 *   - .env.local with CDP credentials
 */

import { createPaymentHeader, selectPaymentRequirements } from 'x402/client';
import { env } from '../lib/env';
import { getOrCreatePurchaserAccount } from '../lib/accounts';

const AGENT_API_URL = 'http://localhost:3001';

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     🤖  Agent Buy Simulation  (x402)              ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  // ── Step 1: Health check ──────────────────────────────────
  console.log('\n🔍 Step 1: Health check');
  const healthRes = await fetch(`${AGENT_API_URL}/api/health`);
  if (!healthRes.ok) {
    console.error(`  ❌ Server not ready (${healthRes.status})`);
    console.error('     Make sure pnpm dev is running on :3001');
    process.exit(1);
  }
  console.log(`  ✅ Server ready at ${AGENT_API_URL}`);

  // ── Step 2: Create/fund Purchaser wallet via CDP ──────────
  console.log('\n🔍 Step 2: Create/fund Purchaser wallet via CDP');
  console.log('  (this creates a CDP account and requests USDC faucet on testnet)');

  const purchaser = await getOrCreatePurchaserAccount();
  console.log(`  ✅ Purchaser address: ${purchaser.address}`);

  // ── Step 3: Request quote WITHOUT payment (expect 402) ───
  console.log('\n🔍 Step 3: Request /api/quote (expect 402)');
  const noPayRes = await fetch(`${AGENT_API_URL}/api/quote`);

  if (noPayRes.status !== 402) {
    console.error(`  ❌ Expected 402, got ${noPayRes.status}`);
    console.error(`     ${await noPayRes.text()}`);
    process.exit(1);
  }

  const paymentBody = await noPayRes.json();
  console.log(`  ✅ Got 402 — x402 middleware active`);
  console.log(`  x402Version: ${paymentBody.x402Version}`);
  console.log(`  Accepts: ${paymentBody.accepts.length} option(s)`);

  // Pick the right payment requirement
  const requirement = selectPaymentRequirements(
    paymentBody.accepts,
    'base-sepolia',
    'exact',
  );
  console.log(`  Selected: ${requirement.maxAmountRequired} units → ${requirement.payTo}`);

  // ── Step 4: Create signed payment header ─────────────────
  console.log('\n🔍 Step 4: Create x402 payment header');
  console.log('  Signing with Purchaser wallet via CDP...');

  const paymentHeader = await createPaymentHeader(
    purchaser,
    paymentBody.x402Version,
    requirement,
  );
  console.log(`  ✅ Payment header created (${paymentHeader.length} chars)`);

  // ── Step 5: Retry with payment header ────────────────────
  console.log('\n🔍 Step 5: Retry /api/quote WITH payment');
  const paidRes = await fetch(`${AGENT_API_URL}/api/quote`, {
    headers: { 'X-PAYMENT': paymentHeader },
  });

  if (paidRes.status === 200) {
    const data = await paidRes.json();
    console.log('  ✅ Payment accepted! Response:');
    console.log(`  ${JSON.stringify(data, null, 4)}`);
  } else {
    const errorBody = await paidRes.text();
    console.error(`  ❌ Payment rejected: ${paidRes.status}`);
    console.error(`     ${errorBody}`);
    process.exit(1);
  }

  // ── Done ──────────────────────────────────────────────────
  console.log('\n🎉 Agent buy simulation complete!');
  console.log(`  Purchased access to "${data.name}"`);
  console.log(`  Paid $0.005 USDC on base-sepolia`);
  console.log(`  Seller: ${requirement.payTo}`);
  console.log('');
}

main().catch((err) => {
  console.error('\n💥 Script failed:', err);
  process.exit(1);
});
