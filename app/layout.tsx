import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sahayak (सहायक) - Voice-First Multilingual Welfare Navigator',
  description: 'AI-powered Indic welfare scheme and document pre-verification navigator powered by Sarvam AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
