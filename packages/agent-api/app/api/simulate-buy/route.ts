/**
 * POST /api/simulate-buy
 *
 * Runs the full x402 agent buy simulation server-side, where webpack
 * handles the viem/chains barrel import correctly.
 *
 * This bypasses the Node.js ESM barrel-import hang that affects
 * standalone tsx scripts (Node.js v25 issue).
 */

import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { getOrCreatePurchaserAccount } from '@/lib/accounts';
import { selectPaymentRequirements, createPaymentHeader } from 'x402/client';

const AGENT_API_URL = `http://localhost:${process.env.PORT ?? 3001}`;

export async function POST() {
  try {
    const results: string[] = [];

    function log(msg: string) {
      console.log(msg);
      results.push(msg);
    }

    // ── Step 1: Health check ──────────────────────────────
    log('🔍 Health check...');
    // (we're inside the server, so we're already healthy)

    // ── Step 2: Create/fund Purchaser wallet ──────────────
    log('🔍 Creating Purchaser wallet via CDP...');
    const purchaser = await getOrCreatePurchaserAccount();
    log(`  ✅ Purchaser: ${purchaser.address}`);

    // ── Step 3: Request quote without payment ─────────────
    log('🔍 GET /api/quote (expect 402)...');
    const noPayRes = await fetch(`${AGENT_API_URL}/api/quote`);
    if (noPayRes.status !== 402) {
      throw new Error(`Expected 402, got ${noPayRes.status}: ${await noPayRes.text()}`);
    }

    const paymentBody = await noPayRes.json();
    log(`  ✅ x402Version: ${paymentBody.x402Version}`);
    log(`  ✅ Accepts: ${paymentBody.accepts.length} option(s)`);

    // ── Step 4: Select payment requirement ────────────────
    const requirement = selectPaymentRequirements(
      paymentBody.accepts,
      env.NETWORK,
      'exact',
    );
    log(`  💰 Pay ${requirement.maxAmountRequired} → ${requirement.payTo}`);

    // ── Step 5: Create & sign payment header ──────────────
    log('🔍 Signing payment header...');
    const paymentHeader = await createPaymentHeader(
      purchaser,
      paymentBody.x402Version,
      requirement,
    );
    log(`  ✅ Header: ${paymentHeader.length} chars`);

    // ── Step 6: Retry WITH payment ────────────────────────
    log('🔍 GET /api/quote (with X-PAYMENT)...');
    const paidRes = await fetch(`${AGENT_API_URL}/api/quote`, {
      headers: { 'X-PAYMENT': paymentHeader },
    });

    if (paidRes.status === 200) {
      const data = await paidRes.json();
      log('  ✅ Payment accepted!');
      return NextResponse.json({ success: true, data, logs: results });
    }

    const errorBody = await paidRes.text();
    throw new Error(`Payment rejected (${paidRes.status}): ${errorBody}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('💥 Simulation failed:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
