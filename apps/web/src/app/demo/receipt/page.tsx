import type { Metadata } from "next";
import { ReceiptDemo } from "./demo";

export const metadata: Metadata = {
  title: "Receipt Demo",
  robots: { index: false, follow: false },
};

export default function ReceiptDemoPage() {
  return <ReceiptDemo />;
}
