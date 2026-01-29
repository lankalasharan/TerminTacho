import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import Logo from "./components/Logo";
import Breadcrumbs from "./components/Breadcrumbs";
import { Providers } from "./providers";
import AuthButton from "./components/AuthButton";
import MenuBar from "./components/MenuBar";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import DarkModeToggle from "./components/DarkModeToggle";
import SearchBar from "./components/SearchBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
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
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script>
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');`}
        </script>
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#667eea" />
      </head>
      <body
        className={`${inter.variable} ${dmSans.variable} antialiased`}
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
          {/* Header with Logo */}
          <header style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid #e5e7eb",
            padding: "12px 16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <style>{`
              @media (max-width: 768px) {
                header {
                  padding: 10px 12px !important;
                }
              }
              @media (max-width: 480px) {
                header {
                  padding: 8px 10px !important;
                }
              }
            `}</style>
            <div style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "6px",
              flexWrap: "nowrap"
            }}>
              <style>{`
                @media (max-width: 768px) {
                  header > div > div {
                    padding: 0 8px !important;
                    gap: 12px !important;
                  }
                }
                @media (max-width: 480px) {
                  header > div > div {
                    padding: 0 4px !important;
                    gap: 8px !important;
                  }
                }
              `}</style>
              <Logo />
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <SearchBar />
                <DarkModeToggle />
                <AuthButton />
                <MenuBar />
              </div>
            </div>
          </header>

          {/* Breadcrumbs */}
          <Breadcrumbs />

          {/* Main Content */}
          <main id="main-content">
            {children}
          </main>
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
