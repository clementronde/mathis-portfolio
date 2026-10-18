import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Inter sert de repli à la police système d'Apple (SF Pro) hors Mac/iPhone
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Portfolio — Photographe',
  description: 'Portfolio personnel — photographie, voyage, lifestyle.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="overflow-hidden">{children}</body>
    </html>
  );
}
