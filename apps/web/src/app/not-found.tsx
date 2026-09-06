import type { Metadata } from "next";
import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "That page isn't on the menu. Find your way back to China Island Asian Grill.",
};

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>China Island Asian Grill</p>
        <h1 className={styles.title}>Not on the menu</h1>
        <p className={styles.body}>
          That page doesn&apos;t exist — but dinner still does. Head back
          home or browse the menu.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>
            Back to Home
          </Link>
          <Link href="/menu" className={styles.secondary}>
            View Menu
          </Link>
        </div>
        <div className={styles.links}>
          <Link href="/order">Order Online</Link>
          <span aria-hidden="true">·</span>
          <Link href="/location">Location Info</Link>
        </div>
      </div>
    </main>
  );
}
