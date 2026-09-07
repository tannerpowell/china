import type { Metadata } from "next";
import Link from "next/link";
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
        <nav className={styles.ownerNav} aria-label="Owner pages">
          <span className={styles.ownerNavActive} aria-current="page">
            Launch Preparation
          </span>
          <span aria-hidden="true">|</span>
          <Link href="/menu-questions">Open Questions</Link>
          <span aria-hidden="true">|</span>
          <Link href="/demo/receipt">Receipt Demo</Link>
        </nav>
        <p className={styles.eyebrow}>Internal · not indexed</p>
        <h1 className={styles.title}>Launch Preparation</h1>
        <p className={styles.lede}>
          What&apos;s shipped, what&apos;s left, and what needs the
          owner — for the China Island Asian Grill site pitch and launch.
        </p>
        <LaunchList />
      </div>
    </main>
  );
}
