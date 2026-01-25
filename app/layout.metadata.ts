import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL('https://termintacho.com'), // Update with your actual domain
  title: {
    default: 'TerminTacho - Real Processing Times for German Bureaucracy',
    template: '%s | TerminTacho'
  },
  description: 'Anonymous, crowdsourced processing times for German visa applications, residence permits, and bureaucratic processes. Real data from real people across 74 cities.',
  keywords: ['Germany', 'visa', 'residence permit', 'Aufenthaltserlaubnis', 'processing time', 'Ausländerbehörde', 'Blue Card', 'citizenship', 'German bureaucracy'],
  authors: [{ name: 'TerminTacho' }],
  creator: 'TerminTacho',
  publisher: 'TerminTacho',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://termintacho.com',
    title: 'TerminTacho - Real Processing Times for German Bureaucracy',
    description: 'Anonymous, crowdsourced processing times for German visa applications, residence permits, and bureaucratic processes. Real data from real people.',
    siteName: 'TerminTacho',
    images: [
      {
        url: '/og-image.png', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'TerminTacho - Real Processing Times',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TerminTacho - Real Processing Times for German Bureaucracy',
    description: 'Anonymous, crowdsourced processing times for German visa applications and residence permits.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://termintacho.com',
  },
  other: {
    'google-site-verification': 'your-verification-code', // Add when you verify with Google Search Console
  },
};
