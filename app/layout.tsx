import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.purohitsetu.in"),
  title: {
    default: "Book Verified Vedic Pandits in Bengaluru | PurohitSetu",
    template: "%s | PurohitSetu",
  },
  description:
    "Book authentic North Indian Vedic Pandits in Bengaluru for Griha Pravesh, Vivah, Hawan and all Sanskars. Gurukul trained, 100% Shastric Vidhi.",
  alternates: {
    canonical: "https://www.purohitsetu.in",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.purohitsetu.in",
    siteName: "PurohitSetu",
    title: "Book Verified Vedic Pandits in Bengaluru | PurohitSetu",
    description:
      "Book authentic North Indian Vedic Pandits in Bengaluru for Griha Pravesh, Vivah, and Hawan. Strict Shastric Vidhi and transparent pricing.",
    images: [
      {
        url: "/pandit-logo.png",
        width: 1200,
        height: 630,
        alt: "PurohitSetu Bengaluru",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Verified Vedic Pandits in Bengaluru | PurohitSetu",
    description:
      "Book authentic North Indian Vedic Pandits in Bengaluru for Griha Pravesh, Vivah, and Hawan. Strict Shastric Vidhi.",
    images: ["/pandit-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://checkout.razorpay.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-SSPSJMON0L"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-SSPSJMON0L');
            `,
          }}
        />
      </head>
      <body className="antialiased bg-[#FFFDF7] text-slate-900">{children}</body>
    </html>
  );
}