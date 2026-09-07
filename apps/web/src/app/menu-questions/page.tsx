import type { Metadata } from "next";
import { MenuQuestionsClient } from "./client";

export const metadata: Metadata = {
  title: "Menu Open Questions",
  description:
    "Internal multiple-choice menu questions for the China Island Asian Grill site. English + 中文.",
  robots: { index: false, follow: false },
};

export default function MenuQuestionsPage() {
  return <MenuQuestionsClient />;
}
