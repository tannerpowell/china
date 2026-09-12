import Script from "next/script";

// Google Analytics 4 placeholder. Renders nothing until
// NEXT_PUBLIC_GA_MEASUREMENT_ID is set (see .env.example).
// The ID is format-validated so a typo can't inject arbitrary script URLs.
// To enable: add the ID in Vercel → Project → Settings → Environment
// Variables, then redeploy.
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function validGaId(id: string | undefined): id is string {
  return !!id && /^G-[A-Za-z0-9]{6,}$/.test(id.trim());
}

export function Analytics() {
  if (!validGaId(GA_ID)) return null;
  const gaId = GA_ID.trim();
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
