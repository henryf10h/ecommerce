import type { Metadata } from 'next';
import './global.css';
import '@coinbase/onchainkit/styles.css';
import dynamic from 'next/dynamic';

const OnchainProviders = dynamic(
  () => import('../components/OnchainProviders'),
  { ssr: false },
);

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export const metadata: Metadata = {
  title: 'commerce-x402',
  description: 'Hybrid e-commerce: humans and agents on Base + USDC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex items-center justify-center">
        <OnchainProviders>{children}</OnchainProviders>
      </body>
    </html>
  );
}
