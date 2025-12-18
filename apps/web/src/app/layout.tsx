import "./globals.css";
import "./styles/menu3-fonts.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "China Island Asian Grill",
  description: "Fresh Asian cuisine, made with care",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
