import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import FloatingPaymentButton from '@/components/FloatingPaymentButton';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#c2410c',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'PurohitSetu | Book Verified Vedic Pandits & Purohits in Bengaluru',
  description:
    'Book authentic Vedic Pandits in Bengaluru for Griha Pravesh, Vivah, Navratri, Havan, and Sanskars. Strict Vedic rituals, transparent pricing, verified Acharyas.',
  keywords: [
    'Pandit in Bangalore',
    'Vedic Purohit Bangalore',
    'Griha Pravesh Puja Bangalore',
    'North Indian Pandit in Bangalore',
    'Bihari Pandit Bangalore',
    'Maithil Pandit Bangalore',
    'Havan and Puja Services',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/pandit-logo.png',
    shortcut: '/pandit-logo.png',
    apple: '/pandit-logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PurohitSetu',
  },
  alternates: {
    canonical: 'https://www.purohitsetu.in',
  },
  openGraph: {
    title: 'PurohitSetu | Book Verified Vedic Pandits in Bengaluru',
    description: 'Book authentic Vedic Pandits in Bengaluru with verified credentials and transparent pricing.',
    url: 'https://www.purohitsetu.in',
    siteName: 'PurohitSetu',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PurohitSetu | Book Verified Vedic Pandits in Bengaluru',
    description: 'Book authentic Vedic Pandits in Bengaluru with verified credentials.',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'HJIrfGTVGeLRdSlSyzt-oxqY3h_Rp0HkVJHCNpMbpkw',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/pandit-logo.png" />
      </head>
      <body className={`${inter.className} bg-stone-50 text-gray-900 antialiased`}>
        <FloatingPaymentButton />
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}