import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BebasHutang - Debt Tracker & Payoff Calculator',
  description: 'Aplikasi pencatat tagihan bulanan, estimasi bunga, dan kalkulator pelunasan hutang cerdas (Snowball & Avalanche) siap Vercel.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
