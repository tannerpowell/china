import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { T } from "@/components/T";
import { SiteSidebar } from "@/components/SiteSidebar";
import { breadcrumbJsonLd } from "@/lib/schema";
import { OrderClient } from "./OrderClient";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Order Online",
  description: "Order online from China Island Asian Grill. Pickup and delivery available.",
  alternates: { canonical: "/order" },
};

export default function OrderPage() {
  return (
    <div className={styles.layout}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Order Online" },
        ])}
      />
      <SiteSidebar active="order" />

      <div className={styles.rightPanel}>
        <main className={styles.main}>
          <header className={styles.head}>
            <p className={styles.eyebrow}>
              China Island Asian Grill
            </p>
            <h1 className={styles.title}>
              <T id="order.title" />
            </h1>
          </header>
          <div className={styles.body}>
            <OrderClient />
          </div>
        </main>
      </div>
    </div>
  );
}
