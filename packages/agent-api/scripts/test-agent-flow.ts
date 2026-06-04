/**
 * Smoke test: verify the x402 middleware is active
 *
 * Usage:
 *   npx tsx packages/agent-api/scripts/test-agent-flow.ts
 *
 * The dev server must be running on port 3001:
 *   pnpm --filter @app/agent-api dev
 */

const AGENT_API_URL = 'http://localhost:3001';

async function main() {
  // ── Step 1: Health check ──────────────────────────────────
  console.log('\n🔍 Step 1: Health check (no payment required)');
  const healthRes = await fetch(`${AGENT_API_URL}/api/health`);
  console.log(`  ${healthRes.ok ? '✅' : '❌'} Status: ${healthRes.status}`);
  const healthBody = await healthRes.json();
  console.log(`  Body: ${JSON.stringify(healthBody)}`);

  if (!healthRes.ok) {
    console.error('\n❌ Server not ready. Make sure pnpm dev is running on :3001');
    process.exit(1);
  }

  // ── Step 2: Request /api/quote WITHOUT payment (expect 402) ─
  console.log('\n🔍 Step 2: Request /api/quote (expect 402)');
  const noPayRes = await fetch(`${AGENT_API_URL}/api/quote`);
  console.log(`  Status: ${noPayRes.status}`);

  if (noPayRes.status === 402) {
    const body = await noPayRes.json();
    console.log('  ✅ Middleware is active — 402 Payment Required');
    console.log(`  x402Version: ${body.x402Version}`);
    console.log(`  Accepts: ${body.accepts.length} payment option(s)`);
    if (body.accepts.length > 0) {
      const opt = body.accepts[0];
      console.log(`  Network: ${opt.network}`);
      console.log(`  Amount: ${opt.maxAmountRequired} (${opt.extra?.name || 'USDC'})`);
      console.log(`  Pay to: ${opt.payTo}`);
      console.log(`  Asset: ${opt.asset}`);
    }
  } else if (noPayRes.status === 200) {
    console.log(`  ⚠️  Got 200 — middleware is NOT protecting /api/quote`);
    const body = await noPayRes.text();
    console.log(`  Body: ${body}`);
  } else {
    console.log(`  ❌ Unexpected status: ${noPayRes.status}`);
    console.log(`  Body: ${await noPayRes.text()}`);
  }

  // ── Summary ────────────────────────────────────────────────
  console.log('\n📋 Summary:');
  console.log(`  /api/health  → ${healthRes.status} ${healthRes.ok ? '✅' : '❌'}`);
  console.log(`  /api/quote  → ${noPayRes.status} ${noPayRes.status === 402 ? '✅ (x402 active)' : '❌'}`);

  if (noPayRes.status === 402) {
    console.log('\n💡 To simulate a full agent buy:');
    console.log('   Run: npx tsx scripts/simulate-agent-buy.ts');
  }
}

main().catch((err) => {
  console.error('\n💥 Script failed:', err);
  process.exit(1);
});
