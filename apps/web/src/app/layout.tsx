import "./globals.css";
import "./styles/menu3-fonts.css";
import type { Metadata } from "next";
import { Sen } from "next/font/google";

const sen = Sen({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
  variable: "--font-sen",
});

export const metadata: Metadata = {
  title: "China Island Asian Grill",
  description: "Fresh Asian cuisine, made with care",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sen.variable}>
      <body>{children}</body>
    </html>
  );
}
