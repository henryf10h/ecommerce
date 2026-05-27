export const metadata = {
  title: 'commerce-x402',
  description: 'Hybrid e-commerce: humans and agents on Base + USDC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
