import type { Metadata } from "next";
import Link from "next/link";
import { SiteSidebar } from "@/components/SiteSidebar";
import {
  restaurant,
  restaurantAddressFull,
  restaurantDirectionsUrl,
  restaurantHoursRows,
  restaurantMapEmbedUrl,
  restaurantMapsQuery,
  restaurantPhoneHref,
} from "@/lib/restaurant";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Visit Us",
  description:
    "About China Island Asian Grill in Flower Mound, TX. Address, phone, hours, pickup & delivery info, map and directions.",
  alternates: { canonical: "/location" },
};

export default function LocationPage() {
  return (
    <div className={styles.layout}>
      <SiteSidebar active="visit" />

      <main className={styles.rightPanel}>
        <div className={styles.welcome}>
          <h1 className={styles.welcomeTitle}>Visit Us</h1>
        </div>

        <section className={styles.block}>
          <span className={styles.eyebrow}>Contact</span>
          <h2 className={styles.blockTitle}>Call to order</h2>
          <p className={styles.body}>
            <a href={restaurantPhoneHref} className={styles.phoneLink}>
              {restaurant.phoneDisplay}
            </a>
          </p>
          <p className={styles.body}>
            Call ahead for pickup — about 15 minutes normally, about 30
            minutes during the evening rush (5:30–7:30 PM).
          </p>
        </section>

        <section className={styles.block}>
          <span className={styles.eyebrow}>Address</span>
          <h2 className={styles.blockTitle}>Where to find us</h2>
          <p className={styles.body}>
            {restaurant.addressStreet}
            <br />
            {restaurant.addressCity}, {restaurant.addressRegion}{" "}
            {restaurant.addressZip}
          </p>
          <div className={styles.pillRow}>
            <a
              href={restaurantDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.pillLink}
            >
              Google Maps
            </a>
            <a
              href={`https://maps.apple.com/?q=${restaurantMapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.pillLink}
            >
              Apple Maps
            </a>
          </div>
          <div className={styles.mapFrame}>
            <iframe
              title={`Map to ${restaurant.name} at ${restaurantAddressFull}`}
              src={restaurantMapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>

        <section className={styles.block}>
          <span className={styles.eyebrow}>Hours</span>
          <h2 className={styles.blockTitle}>When we&apos;re open</h2>
          <div className={styles.hoursList}>
            {restaurantHoursRows.map((row) => (
              <p key={row.days} className={styles.body}>
                <strong>{row.days}:</strong> {row.time}
              </p>
            ))}
          </div>
        </section>

        <section id="about" className={styles.block}>
          <span className={styles.eyebrow}>About</span>
          <h2 className={styles.blockTitle}>Sichuan, Mandarin & Hunan</h2>
          <p className={styles.body}>
            Find us in the {restaurant.shoppingCenter} in Flower Mound.
            Dine in, grab takeout, or get your favorites delivered.
          </p>
          <p className={styles.body}>
            China Island Asian Grill serves Sichuan, Mandarin, and Hunan
            dishes — from takeout classics like General Tso&apos;s chicken
            and crab rangoon to wok-fired chef&apos;s specials. Everything
            is cooked to order, and online ordering makes dinner easy.
          </p>
        </section>

        <section className={styles.block}>
          <span className={styles.eyebrow}>Delivery</span>
          <h2 className={styles.blockTitle}>Get it delivered</h2>
          <p className={styles.body}>
            Delivery runs 45 minutes to 1 hour normally, 1 to 1.5 hours
            during the evening rush. Call to verify. Also find us on your
            favorite delivery app:
          </p>
          <div className={styles.pillRow}>
            <a
              href={restaurant.uberEatsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.pillLink}
            >
              Uber Eats
            </a>
            <a
              href={restaurant.grubhubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.pillLink}
            >
              Grubhub
            </a>
          </div>
        </section>

        <div className={styles.cta}>
          <Link href="/order" className={styles.ctaButton}>
            Order Online →
          </Link>
        </div>
      </main>
    </div>
  );
}
