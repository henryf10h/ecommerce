import { VERSION } from '@app/core';

export default function Page() {
  return (
    <main>
      <h1>commerce-x402 agent API</h1>
      <p>core version: {VERSION}</p>
      <p>
        Health: <code>GET /api/health</code>
      </p>
    </main>
  );
}
