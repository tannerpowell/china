import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/components/T";
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
        <h1 className={styles.title}><T id="nf.title" /></h1>
        <p className={styles.body}>
          <T id="nf.body" />
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>
            <T id="nf.home" />
          </Link>
          <Link href="/menu" className={styles.secondary}>
            <T id="nf.menu" />
          </Link>
        </div>
        <div className={styles.links}>
          <Link href="/order"><T id="nav.order" /></Link>
          <span aria-hidden="true">·</span>
          <Link href="/location"><T id="nav.visit" /></Link>
        </div>
      </div>
    </main>
  );
}
