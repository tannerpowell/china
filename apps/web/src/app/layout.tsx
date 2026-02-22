import "./globals.css";
import "./styles/menu3-fonts.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Sen } from "next/font/google";
import { NavigationProgress } from "@/components/NavigationProgress";

const sen = Sen({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
  variable: "--font-sen",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chinaislandgrill.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "China Island Asian Grill",
    template: "%s | China Island Asian Grill",
  },
  description:
    "Fresh Asian cuisine made with care. Dine-in, takeout & delivery in the greater Houston area. View our full menu and order online.",
  openGraph: {
    type: "website",
    siteName: "China Island Asian Grill",
    title: "China Island Asian Grill",
    description:
      "Fresh Asian cuisine made with care. Dine-in, takeout & delivery. View our full menu and order online.",
    url: baseUrl,
    locale: "en_US",
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
      <body>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
