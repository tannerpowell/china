import type { Metadata } from "next";
import Link from "next/link";
import LaunchList from "./LaunchList";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Go-Live Launch List",
  description: "Internal go-live checklist for the China Island Asian Grill website.",
  robots: { index: false, follow: false },
};

export default function LaunchPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          ← Back to Home
        </Link>
        <p className={styles.eyebrow}>Internal · not indexed</p>
        <h1 className={styles.title}>Go-Live Launch List</h1>
        <p className={styles.lede}>
          What&apos;s shipped, what&apos;s left, and what needs the
          owner — for the China Island Asian Grill site pitch and launch.
        </p>
        <p className={styles.lede}>
          <Link href="/menu-questions" className={styles.backLink}>
            Menu open questions →
          </Link>
        </p>
        <LaunchList />
      </div>
    </main>
  );
}
