import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AutoMusicPlayer from '@/components/AutoMusicPlayer';
import FloatingPaymentButton from '@/components/FloatingPaymentButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.purohitsetu.in'),
  title: 'PurohitSetu | Book Verified Vedic Pandits in Bangalore',
  description:
    'Book authentic and verified Vedic Pandits for Griha Pravesh, Havan, Vivah, and sacred rituals in Bangalore with shastric purity.',
  alternates: {
    canonical: 'https://www.purohitsetu.in',
  },
  keywords: [
    'Pandit in Bangalore',
    'Vedic Purohit Bangalore',
    'Book Pandit Online',
    'Griha Pravesh Puja Bangalore',
    'North Indian Pandit in Bangalore',
  ],
  openGraph: {
    title: 'PurohitSetu | Authentic Vedic Rituals & Certified Pandits',
    description:
      'Connecting devout Yajmans with authentic, verified Vedic Purohits in Bangalore.',
    url: 'https://www.purohitsetu.in',
    siteName: 'PurohitSetu',
    images: [
      {
        url: '/logo.jpg',
        width: 800,
        height: 600,
        alt: 'PurohitSetu Vedic Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
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
        {/* Global Vedic Audio Background */}
        <AutoMusicPlayer />

        {/* Permanent Optional Floating Payment / Dakshina Button */}
        <FloatingPaymentButton />

        {/* Page Views */}
        {children}
      </body>
    </html>
  );
}