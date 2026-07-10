"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { COOKIE_CONSENT_EVENT, getStoredConsent } from "@/lib/cookie-consent";

const GA_MEASUREMENT_ID = "G-QXFD8S7VK0";

// Solo carga Google Analytics (y su cookie _ga) si el usuario dio consentimiento
// analítico explícito en el banner de cookies.
export default function ConditionalAnalytics() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setAnalyticsEnabled(getStoredConsent()?.analytics ?? false);
    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, []);

  if (!analyticsEnabled) return null;

  return (
    <>
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
