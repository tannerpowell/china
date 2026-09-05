import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import styles from "./page.module.css";

import {
  restaurant,
  restaurantAddressFull,
  restaurantPhoneHref,
} from "@/lib/restaurant";

// Restaurant info: env overrides win, verified Flower Mound values are the fallback
const phone = process.env.NEXT_PUBLIC_RESTAURANT_PHONE || restaurant.phoneDisplay;
const hours = process.env.NEXT_PUBLIC_RESTAURANT_HOURS || restaurant.hoursSummary;
const address = process.env.NEXT_PUBLIC_RESTAURANT_ADDRESS || restaurantAddressFull;
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chinaislandgrill.com";

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: restaurant.name,
  description: "Fresh Asian cuisine made with care. Dine-in, takeout & delivery.",
  url: baseUrl,
  telephone: phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: restaurant.addressStreet,
    addressLocality: restaurant.addressCity,
    addressRegion: restaurant.addressRegion,
    postalCode: restaurant.addressZip,
    addressCountry: "US",
  },
  servesCuisine: [...restaurant.cuisines],
  hasMenu: `${baseUrl}/menu`,
  acceptsReservations: false,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "11:00",
      closes: "21:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Friday", "Saturday"],
      opens: "11:00",
      closes: "21:30",
    },
  ],
};

export default function Home() {
  return (
    <div className={styles.layout}>
      <JsonLd data={restaurantJsonLd} />
      {/* Fixed Left Panel */}
      <aside className={styles.leftPanel}>
        <div className={styles.intro}>
          <Image
            src="/logo.png"
            alt="China Island Asian Grill"
            className={styles.logo}
            width={200}
            height={200}
            priority
          />
          <h1 className={styles.title}>China Island</h1>
          <p className={styles.subtitle}>Asian Grill</p>

          <nav className={styles.nav}>
            <Link href="/menu" className={styles.navLink}>
              Menu
            </Link>
            <Link href="/order" className={styles.navLink}>
              Order Online
            </Link>
            <Link href="/location" className={styles.navLink}>
              Visit Us
            </Link>
          </nav>

          <p className={styles.blurb}>
            Fresh Asian cuisine made with care. We offer dine-in, takeout, and delivery options for all your favorite dishes.
            <br /><br />
            <a href={restaurantPhoneHref} className={styles.aboutLink}>Call to Order: {phone}</a>
          </p>

          <div className={styles.hours}>
            <strong>Hours</strong><br />
            {hours}
          </div>
        </div>
      </aside>

      {/* Scrolling Right Panel */}
      <main className={styles.rightPanel}>
        <div className={styles.welcome}>
          <h2 className={styles.welcomeTitle}>Welcome</h2>
          <p className={styles.welcomeText}>
            Browse our menu and order your favorites online. Click any category below to explore our dishes.
          </p>
        </div>

        <div className={styles.categoryCards}>
          <Link href="/menu#soups" className={styles.card}>
            <span className={styles.cardCategory}>Soups</span>
            <h3 className={styles.cardTitle}>Start with Soup</h3>
            <div className={styles.cardItems}>
              <p>Hot & Sour Soup</p>
              <p>Egg Drop Soup</p>
              <p>Wonton Soup</p>
            </div>
          </Link>

          <Link href="/menu#appetizers" className={styles.card}>
            <span className={styles.cardCategory}>Appetizers</span>
            <h3 className={styles.cardTitle}>Appetizers</h3>
            <div className={styles.cardItems}>
              <p>Egg Rolls</p>
              <p>Crab Rangoon</p>
              <p>Pot Stickers</p>
              <p>Chicken Wings</p>
            </div>
          </Link>

          <Link href="/menu#favorites" className={styles.card}>
            <span className={styles.cardCategory}>House Favorites</span>
            <h3 className={styles.cardTitle}>Favorites</h3>
            <div className={styles.cardItems}>
              <p>General Tso's Chicken</p>
              <p>Orange Chicken</p>
              <p>Kung Pao Chicken</p>
              <p>Sesame Chicken</p>
            </div>
          </Link>

          <Link href="/menu#fried-rice" className={styles.card}>
            <span className={styles.cardCategory}>Fried Rice</span>
            <h3 className={styles.cardTitle}>Fried Rice</h3>
            <div className={styles.cardItems}>
              <p>Chicken Fried Rice</p>
              <p>Shrimp Fried Rice</p>
              <p>Vegetable Fried Rice</p>
              <p>Combo Fried Rice</p>
            </div>
          </Link>

          <Link href="/menu#noodles" className={styles.card}>
            <span className={styles.cardCategory}>Noodles</span>
            <h3 className={styles.cardTitle}>Noodles</h3>
            <div className={styles.cardItems}>
              <p>Lo Mein</p>
              <p>Chow Mein</p>
              <p>Pad Thai</p>
              <p>Singapore Noodles</p>
            </div>
          </Link>

          <Link href="/menu#specialties" className={styles.card}>
            <span className={styles.cardCategory}>Specialties</span>
            <h3 className={styles.cardTitle}>Chef's Specials</h3>
            <div className={styles.cardItems}>
              <p>Peking Duck</p>
              <p>Salt & Pepper Shrimp</p>
              <p>Mongolian Beef</p>
            </div>
          </Link>
        </div>

        <div className={styles.cta}>
          <Link href="/menu" className={styles.ctaButton}>
            View Full Menu →
          </Link>
        </div>
      </main>
    </div>
  );
}
