import type { Metadata, Viewport } from 'next';
import { Assistant } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
import AccessibilityWidget from '@/components/shared/AccessibilityWidget';
import Providers from '@/components/layout/Providers';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://ticketil.com';

const assistant = Assistant({
  subsets: ['latin', 'hebrew'],
  variable: '--font-assistant',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TicketIL - כרטיסים לליגת העל',
    template: '%s | TicketIL',
  },
  description:
    'קנה ומכור כרטיסים לליגת העל בכדורגל הישראלי. מוכרים מאומתים, ללא עמלות. יצירת קשר ישירה דרך WhatsApp.',
  keywords: [
    'כרטיסים',
    'ליגת העל',
    'כדורגל',
    'כרטיסים יד שנייה',
    'TicketIL',
  ],
  applicationName: 'TicketIL',
  authors: [{ name: 'TicketIL' }],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: SITE_URL,
    siteName: 'TicketIL',
    title: 'TicketIL - כרטיסים לליגת העל',
    description:
      'קנה ומכור כרטיסים לליגת העל בכדורגל הישראלי. מוכרים מאומתים, ללא עמלות.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TicketIL - כרטיסים לליגת העל',
    description:
      'קנה ומכור כרטיסים לליגת העל בכדורגל הישראלי. מוכרים מאומתים, ללא עמלות.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#7C5CFC',
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
          <AccessibilityWidget />
        </Providers>
      </body>
    </html>
  );
}
