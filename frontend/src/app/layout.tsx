import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 Predictor | Make Your Predictions',
  description: 'Create and share your FIFA World Cup 2026 predictions. Compete with fans worldwide, win exclusive rewards, and unlock achievements!',
  keywords: 'World Cup, FIFA 2026, predictions, football, soccer, tournament, bracket',
  openGraph: {
    title: 'FIFA World Cup 2026 Predictor',
    description: 'Make your predictions for the biggest football tournament in the world!',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}