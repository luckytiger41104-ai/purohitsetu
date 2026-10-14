import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.purohitsetu.in'),
  title: 'PurohitSetu | Best Vedic Hindi Pandit in Bangalore | Book Gurukul Acharyas',
  description:
    'Book verified Gurukul-trained Vedic Hindi Pandits in Bengaluru for Griha Pravesh, Vivah, Satyanarayan Puja, Rudrabhishek & Shradh. 100% Shastric precision, zero superstitions.',
  keywords: [
    'PurohitSetu',
    'purohit setu bangalore',
    'best hindi pandit in bangalore',
    'vedic pandit in bengaluru',
    'book pandit online bangalore',
    'north indian pandit in bangalore',
    'griha pravesh puja bangalore',
    'pandit for pooja bangalore',
    'purohit bangalore'
  ],
  alternates: {
    canonical: 'https://www.purohitsetu.in',
  },
  openGraph: {
    title: 'PurohitSetu | Best Vedic Hindi Pandit in Bangalore',
    description: 'Book verified Gurukul-trained Vedic Acharyas for authentic Pujas at home in Bengaluru.',
    url: 'https://www.purohitsetu.in',
    siteName: 'PurohitSetu',
    locale: 'en_IN',
    type: 'website',
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
    url: 'https://www.purohitsetu.in',
    telephone: '+91-7667984349',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '12.9716',
      longitude: '77.5946',
    },
    areaServed: {
      '@type': 'City',
      name: 'Bengaluru',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1250',
    },
    offers: {
      '@type': 'Offer',
      description: 'Authentic Vedic Pujas and Sanskars at home in Bangalore',
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
      <body className="antialiased selection:bg-[#ff9933] selection:text-white">
        {children}
      </body>
    </html>
  );
}