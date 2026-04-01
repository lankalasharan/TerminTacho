"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }: { GA_MEASUREMENT_ID: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const currentConsent = localStorage.getItem("cookie-consent");
    setEnabled(currentConsent === "accepted");

    const handleConsentUpdate = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail) {
        setEnabled(detail === "accepted");
        return;
      }

      const stored = localStorage.getItem("cookie-consent");
      setEnabled(stored === "accepted");
    };

    window.addEventListener("cookie-consent-updated", handleConsentUpdate);
    window.addEventListener("storage", handleConsentUpdate);

    return () => {
      window.removeEventListener("cookie-consent-updated", handleConsentUpdate);
      window.removeEventListener("storage", handleConsentUpdate);
    };
  }, [GA_MEASUREMENT_ID]);

  if (!GA_MEASUREMENT_ID || !enabled) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
