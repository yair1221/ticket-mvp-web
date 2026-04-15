import type { Metadata, Viewport } from 'next';
import { Assistant } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
import Providers from '@/components/layout/Providers';

const assistant = Assistant({
  subsets: ['latin', 'hebrew'],
  variable: '--font-assistant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TicketIL - כרטיסים לליגת העל',
  description: 'קנה ומכור כרטיסים לליגת העל בכדורגל הישראלי. מוכרים מאומתים, ללא עמלות.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563EB',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={assistant.variable}>
      <body className="min-h-dvh pb-20">
        <Providers>
          <main className="max-w-lg mx-auto">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
