import type { Metadata } from 'next';
import { Providers } from '../components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kids Chess & Strategic Thinking Academy',
  description: 'Learn chess. Think strategically. Grow confidently. A gamified online chess academy designed for kids.',
  keywords: ['chess for kids', 'strategic thinking', 'kids chess academy', 'chess puzzles', 'chess tournaments'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

