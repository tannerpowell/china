import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { T } from "@/components/T";
import { SiteSidebar } from "@/components/SiteSidebar";
import {
  restaurant,
  restaurantDirectionsUrl,
} from "@/lib/restaurant";
import styles from "./page.module.css";

// Restaurant info: verified Flower Mound values from lib/restaurant.ts.
// Only the phone number honors a NEXT_PUBLIC_RESTAURANT_PHONE override.
const phone = restaurant.phoneDisplay;
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
  priceRange: restaurant.priceRange,
  image: `${baseUrl}/logo.png`,
  hasMap: restaurantDirectionsUrl,
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
      <SiteSidebar />

      {/* Scrolling Right Panel */}
      <main className={styles.rightPanel}>
        <div className={styles.welcome}>
          <h2 className={styles.welcomeTitle}><T id="home.welcome" /></h2>
          <p className={styles.welcomeText}>
            <T id="home.lede" />
          </p>
        </div>

        <div className={styles.categoryCards}>
          <Link href="/menu#soups" className={styles.card}>
            <span className={styles.cardCategory}><T id="home.card.soups" /></span>
            <h3 className={styles.cardTitle}><T id="home.card.soupsTitle" /></h3>
            <div className={styles.cardItems}>
              <p>Hot & Sour Soup</p>
              <p>Egg Drop Soup</p>
              <p>Wonton Soup</p>
            </div>
          </Link>

          <Link href="/menu#appetizers" className={styles.card}>
            <span className={styles.cardCategory}><T id="home.card.appetizers" /></span>
            <h3 className={styles.cardTitle}><T id="home.card.appetizersTitle" /></h3>
            <div className={styles.cardItems}>
              <p>Egg Rolls</p>
              <p>Crab Rangoon</p>
              <p>Pot Stickers</p>
              <p>Chicken Wings</p>
            </div>
          </Link>

          <Link href="/menu#favorites" className={styles.card}>
            <span className={styles.cardCategory}><T id="home.card.favorites" /></span>
            <h3 className={styles.cardTitle}><T id="home.card.favoritesTitle" /></h3>
            <div className={styles.cardItems}>
              <p>General Tso's Chicken</p>
              <p>Orange Chicken</p>
              <p>Kung Pao Chicken</p>
              <p>Sesame Chicken</p>
            </div>
          </Link>

          <Link href="/menu#fried-rice" className={styles.card}>
            <span className={styles.cardCategory}><T id="home.card.friedRice" /></span>
            <h3 className={styles.cardTitle}><T id="home.card.friedRiceTitle" /></h3>
            <div className={styles.cardItems}>
              <p>Chicken Fried Rice</p>
              <p>Shrimp Fried Rice</p>
              <p>Vegetable Fried Rice</p>
              <p>Combo Fried Rice</p>
            </div>
          </Link>

          <Link href="/menu#noodles" className={styles.card}>
            <span className={styles.cardCategory}><T id="home.card.noodles" /></span>
            <h3 className={styles.cardTitle}><T id="home.card.noodlesTitle" /></h3>
            <div className={styles.cardItems}>
              <p>Lo Mein</p>
              <p>Chow Mein</p>
              <p>Pad Thai</p>
              <p>Singapore Noodles</p>
            </div>
          </Link>

          <Link href="/menu#specialties" className={styles.card}>
            <span className={styles.cardCategory}><T id="home.card.specialties" /></span>
            <h3 className={styles.cardTitle}><T id="home.card.specialtiesTitle" /></h3>
            <div className={styles.cardItems}>
              <p>Peking Duck</p>
              <p>Salt & Pepper Shrimp</p>
              <p>Mongolian Beef</p>
            </div>
          </Link>
        </div>

        <div className={styles.cta}>
          <Link href="/menu" className={styles.ctaButton}>
            <T id="home.viewMenu" /> →
          </Link>
        </div>

        <div className={styles.launchLink}>
          <Link href="/launch"><T id="home.checklist" /></Link>
        </div>
      </main>
    </div>
  );
}
