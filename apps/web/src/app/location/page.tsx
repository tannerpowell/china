import type { Metadata } from "next";
import Link from "next/link";
import {
  restaurant,
  restaurantAddressFull,
  restaurantDirectionsUrl,
  restaurantHoursRows,
  restaurantMapEmbedUrl,
  restaurantPhoneHref,
} from "@/lib/restaurant";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About & Visit Us",
  description:
    "About China Island Asian Grill in Flower Mound, TX. Address, phone, hours, pickup & delivery info, map and directions.",
  alternates: { canonical: "/location" },
};

export default function LocationPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          ← Back to Home
        </Link>

        <p className={styles.eyebrow}>Visit Us</p>
        <h1 className={styles.title}>
          {restaurant.shortName} in Flower Mound
        </h1>
        <p className={styles.lede}>
          Fresh Asian cuisine made with care — dine in with us, grab takeout
          on your way home, or get your favorites delivered.
        </p>

        {/* About */}
        <section id="about" className={styles.about}>
          <h2 className={styles.sectionTitle}>About Us</h2>
          <p className={styles.aboutText}>
            China Island Asian Grill serves Sichuan, Mandarin, and Hunan dishes
            in the {restaurant.shoppingCenter} — from takeout classics like
            General Tso&apos;s chicken and crab rangoon to wok-fired
            chef&apos;s specials. Everything is cooked to order, and online
            ordering makes dinner easy.
          </p>
          <div className={styles.cuisineTags}>
            {["Sichuan", "Mandarin", "Hunan"].map((c) => (
              <span key={c} className={styles.cuisineTag}>
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* Info cards */}
        <section className={styles.cards}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Address</h2>
            <address className={styles.cardBody}>
              {restaurant.addressStreet}
              <br />
              {restaurant.addressCity}, {restaurant.addressRegion}{" "}
              {restaurant.addressZip}
            </address>
            <a
              href={restaurantDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cardLink}
            >
              Get Directions →
            </a>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Contact</h2>
            <p className={styles.cardBody}>
              <a href={restaurantPhoneHref} className={styles.phoneLink}>
                {restaurant.phoneDisplay}
              </a>
              <br />
              Call ahead for pickup — normal pickup time is about 15 minutes.
            </p>
            <a href={restaurantPhoneHref} className={styles.cardLink}>
              Call to Order →
            </a>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Hours</h2>
            <dl className={styles.hoursList}>
              {restaurantHoursRows.map((row) => (
                <div key={row.days} className={styles.hoursRow}>
                  <dt>{row.days}</dt>
                  <dd>{row.time}</dd>
                </div>
              ))}
            </dl>
            <Link href="/menu" className={styles.cardLink}>
              Browse the Menu →
            </Link>
          </div>
        </section>

        {/* Map */}
        <section className={styles.mapSection}>
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

        {/* Pickup & delivery */}
        <section className={styles.delivery}>
          <h2 className={styles.sectionTitle}>Pickup & Delivery</h2>
          <ul className={styles.deliveryList}>
            <li>
              <strong>Pickup:</strong> about 15 minutes normally, about 30
              minutes during the evening rush (5:30–7:30 PM).
            </li>
            <li>
              <strong>Delivery:</strong> 45 minutes to 1 hour normally, 1 to
              1.5 hours during the evening rush. Call to verify.
            </li>
          </ul>
          <div className={styles.ctaRow}>
            <Link href="/order" className={styles.ctaPrimary}>
              Order Online
            </Link>
            <a
              href={restaurant.uberEatsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaSecondary}
            >
              Uber Eats
            </a>
            <a
              href={restaurant.grubhubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaSecondary}
            >
              Grubhub
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
