export const metadata = {
  title: 'commerce-x402 agent API',
  description: 'x402-gated endpoints for AI agent commerce on Base + USDC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
