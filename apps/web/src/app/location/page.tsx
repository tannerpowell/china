import type { Metadata } from "next";
import Link from "next/link";
import { SiteSidebar } from "@/components/SiteSidebar";
import { JsonLd } from "@/components/JsonLd";
import { T } from "@/components/T";
import { breadcrumbJsonLd } from "@/lib/schema";
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
  title: "Location Info",
  description:
    "About China Island Asian Grill in Flower Mound, TX. Address, phone, hours, pickup & delivery info, map and directions.",
  alternates: { canonical: "/location" },
};

// Visible FAQ renders bilingual via T ids below; JSON-LD stays English.
const faqs = [
  {
    q: "How long does pickup take?",
    a: "About 15 minutes normally, and about 30 minutes during the evening rush (5:30–7:30 p.m.). Call ahead and we'll have it ready.",
    qId: "loc.faq1q",
    aId: "loc.faq1a",
  },
  {
    q: "Do you offer delivery?",
    a: "Yes. Delivery runs 45 minutes to 1 hour normally, and 1 to 1.5 hours during the evening rush — call to verify. We're also on Uber Eats and Grubhub.",
    qId: "loc.faq2q",
    aId: "loc.faq2a",
  },
  {
    q: "Where are you located?",
    a: "6101 Long Prairie Rd, Suite 740, Flower Mound, TX 75028, in the Highland of Flower Mound Shopping Center.",
    qId: "loc.faq3q",
    aId: "loc.faq3a",
  },
  {
    q: "What are your hours?",
    a: "Sunday through Thursday, 11 a.m. to 9 p.m.; Friday and Saturday, 11 a.m. to 9:30 p.m.",
    qId: "loc.faq4q",
    aId: "loc.faq4a",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function LocationPage() {
  return (
    <div className={styles.layout}>
      <JsonLd data={faqJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Location Info" },
        ])}
      />
      <SiteSidebar active="visit" />

      <main className={styles.rightPanel}>
        <div className={styles.welcome}>
          <h1 className={styles.welcomeTitle}><T id="loc.title" /></h1>
          <Link href="/order" className={styles.headerCta}>
            <T id="nav.order" />
          </Link>
        </div>

        <div className={styles.topRow}>
          <section className={styles.topCol}>
            <span className={styles.eyebrow}><T id="loc.call" /></span>
            <p className={styles.body}>
              <a href={restaurantPhoneHref} className={styles.phoneLink}>
                {restaurant.phoneDisplay}
              </a>
            </p>
          <p className={styles.body}>
            <T id="loc.pickup" />
          </p>
          </section>

          <section className={styles.topCol}>
            <span className={styles.eyebrow}><T id="loc.address" /></span>
            <p className={`${styles.body} ${styles.bodyStrong}`}>
              {restaurant.addressStreet}
              <br />
              {restaurant.addressCity}, {restaurant.addressRegion}{" "}
              {restaurant.addressZip}
            </p>
            <div className={styles.pillRow}>
              <a
                href={`https://maps.apple.com/?q=${restaurantMapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.pillLink}
              >
                Apple Maps
              </a>
              <a
                href={restaurantDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.pillLink}
              >
                Google Maps
              </a>
            </div>
          </section>

          <section className={styles.topCol}>
            <span className={styles.eyebrow}><T id="loc.hours" /></span>
            <div className={styles.hoursList}>
              {restaurantHoursRows.map((row, i) => (
                <p key={row.days} className={`${styles.body} ${styles.hoursBody}`}>
                  {i === 0 ? <T id="loc.hoursSunThu" /> : <T id="loc.hoursFriSat" />}
                  <br />
                  <strong>{row.time}</strong>
                </p>
              ))}
            </div>
          </section>
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

        <section id="about" className={styles.block}>
          <span className={styles.eyebrow}><T id="loc.about" /></span>
          <h2 className={styles.blockTitle}><T id="loc.aboutTitle" /></h2>
          <p className={styles.body}>
            <T id="loc.about1" />
          </p>
          <p className={styles.body}>
            {/* Cuisine + dish names stay English: menu taxonomy, translated with the menu. */}
            China Island Asian Grill serves Sichuan, Mandarin, and Hunan
            dishes — from takeout classics like General Tso&apos;s chicken
            and crab rangoon to wok-fired chef&apos;s specials. <T id="loc.about2" />
          </p>
        </section>

        <section className={styles.block}>
          <span className={styles.eyebrow}><T id="loc.delivery" /></span>
          <h2 className={styles.blockTitle}><T id="loc.deliveryTitle" /></h2>
          <p className={styles.body}>
            <T id="loc.deliveryBody" />
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
        <section className={styles.block}>
          <span className={styles.eyebrow}><T id="loc.faq" /></span>
          <h2 className={styles.blockTitle}><T id="loc.faqTitle" /></h2>
          <dl className={styles.faqList}>
            {faqs.map((f) => (
              <div key={f.q} className={styles.faqItem}>
                <dt className={styles.faqQ}><T id={f.qId} /></dt>
                <dd className={styles.faqA}><T id={f.aId} /></dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}
