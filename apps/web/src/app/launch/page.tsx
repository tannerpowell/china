import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { T } from "@/components/T";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteThemeToggle } from "@/components/SiteThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import LaunchList from "./LaunchList";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Launch Preparation",
  description: "Internal go-live checklist for the China Island Asian Grill website.",
  robots: { index: false, follow: false },
};

export default function LaunchPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.homeBrand} aria-label="China Island Asian Grill — home">
          <Image src="/logo.png" alt="" width={32} height={32} />
          <span>China Island</span>
        </Link>
        <div className={styles.ownerBar}>
          <nav className={styles.ownerNav} aria-label="Owner pages">
            <span className={styles.ownerNavActive} aria-current="page">
              <T id="nav.launch" />
            </span>
            <Link href="/menu-questions"><T id="nav.questions" /></Link>
            <Link href="/demo/receipt"><T id="nav.receiptDemo" /></Link>
          </nav>
          <div className={styles.toggles}>
            <SiteThemeToggle />
            <LanguageToggle compact />
          </div>
        </div>
        <p className={styles.eyebrow}>Internal · not indexed</p>
        <h1 className={styles.title}>Launch Preparation</h1>
        <p className={styles.lede}>
          What&apos;s shipped, what&apos;s left, and what needs the
          owner — for the China Island Asian Grill site pitch and launch.
        </p>
        <LaunchList />
        <SiteFooter />
      </div>
    </main>
  );
}
