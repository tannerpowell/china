import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Sen } from "next/font/google";
import { NavigationProgress } from "@/components/NavigationProgress";
import { Analytics } from "@/components/Analytics";
import { SITE_THEME_KEY } from "@/lib/site-theme";

const sen = Sen({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
  variable: "--font-sen",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chinaislandgrill.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  title: {
    default: "China Island Asian Grill",
    template: "%s | China Island Asian Grill",
  },
  description:
    "Fresh Asian cuisine made with care. Dine-in, takeout & delivery in Flower Mound, TX. View our full menu and order online.",
  openGraph: {
    type: "website",
    siteName: "China Island Asian Grill",
    title: "China Island Asian Grill",
    description:
      "Fresh Asian cuisine made with care. Dine-in, takeout & delivery. View our full menu and order online.",
    url: baseUrl,
    locale: "en_US",
    images: [{ url: "/logo.png", alt: "China Island Asian Grill" }],
  },
  twitter: {
    card: "summary",
    title: "China Island Asian Grill",
    description: "Fresh Asian cuisine made with care. View our menu and order online.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sen.variable}>
      <head>
        {/* Apply the stored theme before paint: no flash, and pages without
            the toggle island (e.g. 404) still respect the choice. */}
        <Script id="site-theme" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem(${JSON.stringify(
            SITE_THEME_KEY
          )});if(t==='classic'||t==='warm'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}`}
        </Script>
      </head>
      <body>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
