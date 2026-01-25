import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import Logo from "./components/Logo";
import { Providers } from "./providers";
import AuthButton from "./components/AuthButton";
import MenuBar from "./components/MenuBar";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";

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
      </head>
      <body
        className={`${inter.variable} ${dmSans.variable} antialiased`}
      >
        <Providers>
          {/* Header with Logo */}
          <header style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid #e5e7eb",
            padding: "16px 0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <Logo />
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <AuthButton />
                <MenuBar />
              </div>
            </div>
          </header>

          {/* Main Content */}
          {children}
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
