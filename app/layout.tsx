import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// import AutoMusicPlayer from '@/components/AutoMusicPlayer';
import FloatingPaymentButton from '@/components/FloatingPaymentButton';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#ea580c',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'PurohitSetu | Book Verified Vedic Pandits & Purohits in Bengaluru',
  description: 'Book authentic Vedic Pandits in Bengaluru for Griha Pravesh, Vivah, Navratri, Havan, and Sanskars. Strict Vedic rituals, transparent pricing, verified Acharyas.',
  keywords: [
    'Pandit in Bangalore',
    'Vedic Purohit Bangalore',
    'Griha Pravesh Puja Bangalore',
    'North Indian Pandit in Bangalore',
    'Bihari Pandit Bangalore',
    'Maithil Pandit Bangalore',
    'Havan and Puja Services'
  ],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-stone-50 text-gray-900 antialiased`}>
        {/* Global Vedic Audio Background Disabled for Performance */}
        {/* <AutoMusicPlayer /> */}

        {/* Permanent Optional Floating Payment / Dakshina Button */}
        <FloatingPaymentButton />

        {/* Page Views */}
        <main id="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}