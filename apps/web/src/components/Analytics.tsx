import Script from "next/script";

// Google Analytics 4 placeholder. Renders nothing until
// NEXT_PUBLIC_GA_MEASUREMENT_ID is set (see .env.example).
// To enable: add the ID in Vercel → Project → Settings → Environment
// Variables, then redeploy.
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function Analytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
