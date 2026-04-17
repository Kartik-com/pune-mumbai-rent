import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pune.rent'),
  title: {
    default: 'Real Rent Prices — Anonymous Community Data | City Rent Map',
    template: '%s | City Rent Map',
  },
  description:
    'Real rent prices in Pune & Mumbai, pinned anonymously by residents. No brokers, no estimates — see what your neighbors actually pay.',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'City Rent Map',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable}`} suppressHydrationWarning>
      <body className="bg-background text-text1 antialiased font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
