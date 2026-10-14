import type { Metadata } from 'next';
import './globals.css';
import AutoMusicPlayer from '@/components/AutoMusicPlayer';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.purohitsetu.in'),
  title: 'PurohitSetu | Best Vedic Hindi Pandit in Bangalore | Book Gurukul Acharyas',
  description:
    'Book verified Gurukul-trained Vedic Hindi Pandits in Bengaluru for Griha Pravesh, Vivah, Satyanarayan Puja, Rudrabhishek & Shradh. 100% Shastric precision, zero superstitions.',
  keywords: [
    'Hindi Pandit in Bangalore',
    'North Indian Pandit Bangalore',
    'Vedic Pandit Bangalore',
    'Griha Pravesh Puja Pandit',
    'Satyanarayan Puja Pandit Bangalore',
    'PurohitSetu',
  ],
  alternates: {
    canonical: 'https://www.purohitsetu.in/',
  },
  openGraph: {
    title: 'PurohitSetu | Best Vedic Hindi Pandit in Bangalore',
    description:
      'Book verified Gurukul-trained Vedic Hindi Pandits in Bengaluru for authentic Vedic rituals.',
    url: 'https://www.purohitsetu.in/',
    siteName: 'PurohitSetu',
    images: [
      {
        url: 'https://www.purohitsetu.in/logo.jpg',
        width: 800,
        height: 600,
        alt: 'PurohitSetu Vedic Rituals',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PurohitSetu | Vedic Hindi Pandit in Bangalore',
    description: 'Book authentic Gurukul Acharyas in Bengaluru.',
    images: ['https://www.purohitsetu.in/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'PurohitSetu',
    image: 'https://www.purohitsetu.in/logo.jpg',
    url: 'https://www.purohitsetu.in/',
    telephone: '+91-7667984349',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      addressCountry: 'IN',
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen">
        {/* Global Vedic Mantra Player with Floating Toggle Button */}
        <AutoMusicPlayer />
        {children}
      </body>
    </html>
  );
}