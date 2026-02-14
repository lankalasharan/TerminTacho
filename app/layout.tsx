import type { Metadata } from "next";
import { Space_Grotesk, Fraunces, Orbitron } from "next/font/google";
import "./globals.css";
import Logo from "./components/Logo";
import Breadcrumbs from "./components/Breadcrumbs";
import { Providers } from "./providers";
import AuthButton from "./components/AuthButton";
import MenuBar from "./components/MenuBar";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import SearchBar from "./components/SearchBar";
import GoogleAnalytics from "./components/GoogleAnalytics";
import PageTransition from "./components/PageTransition";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-serif-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "900"],
});

const orbitron = Orbitron({
  variable: "--font-logo",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: 'TerminTacho - Real Processing Times for German Bureaucracy',
    template: '%s | TerminTacho'
  },
  description: 'Anonymous, crowdsourced processing times for German visa applications, residence permits, and bureaucratic processes. Real data from real people across 74 cities.',
  keywords: ['Germany', 'visa', 'residence permit', 'Aufenthaltserlaubnis', 'processing time', 'Ausländerbehörde', 'Blue Card', 'citizenship', 'German bureaucracy'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://termintacho.com',
    title: 'TerminTacho - Real Processing Times for German Bureaucracy',
    description: 'Anonymous, crowdsourced processing times for German visa applications, residence permits, and bureaucratic processes.',
    siteName: 'TerminTacho',
    images: [
      {
        url: 'https://termintacho.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TerminTacho - Real Processing Times for German Bureaucracy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TerminTacho - Real Processing Times for German Bureaucracy',
    description: 'Anonymous, crowdsourced processing times for German visa applications and residence permits.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""} />
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#5c8f86" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${fraunces.variable} ${orbitron.variable} antialiased`}
      >
        {/* Skip to Content Link (Accessibility) - CSS only, no event handlers */}
        <style>{`
          a.skip-to-content {
            position: absolute;
            top: -40px;
            left: -40px;
            background: #667eea;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            z-index: 10000;
          }
          a.skip-to-content:focus {
            top: 10px;
            left: 10px;
          }
        `}</style>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        <Providers>
          <div className="tt-shell">
            {/* Header with Logo */}
            <header className="tt-header">
              <div className="tt-header-inner">
                <Logo />
                <div className="tt-header-actions" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <SearchBar />
                  <AuthButton />
                  <MenuBar />
                </div>
              </div>
            </header>

            {/* Breadcrumbs */}
            <Breadcrumbs />

            {/* Main Content */}
            <main id="main-content" className="tt-main">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <CookieConsent />
          </div>
        </Providers>
      </body>
    </html>
  );
}
