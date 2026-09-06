import Image from "next/image";
import Link from "next/link";
import {
  restaurant,
  restaurantHoursShort,
  restaurantPhoneHref,
} from "@/lib/restaurant";
import { SiteThemeToggle } from "./SiteThemeToggle";
import styles from "./SiteSidebar.module.css";

interface SiteSidebarProps {
  active?: "menu" | "order" | "visit";
}

// Shared left panel: chop-seal logo, brand, pill nav, blurb, hours.
// Visual home of the site — every page using this shell matches home.
// Business facts come from lib/restaurant.ts only; no raw env reads here.
export function SiteSidebar({ active }: SiteSidebarProps) {
  const phone = restaurant.phoneDisplay;

  return (
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
          <Link
            href="/menu"
            className={`${styles.navLink} ${active === "menu" ? styles.navLinkActive : ""}`}
          >
            Menu
          </Link>
          <Link
            href="/order"
            className={`${styles.navLink} ${active === "order" ? styles.navLinkActive : ""}`}
          >
            Order Online
          </Link>
          <Link
            href="/location"
            className={`${styles.navLink} ${active === "visit" ? styles.navLinkActive : ""}`}
          >
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
          {restaurantHoursShort.map((row) => (
            <span key={row.days} className={styles.hoursRow}>
              {row.days}: {row.time}
            </span>
          ))}
        </div>

        <div className={styles.themeWrap}>
          <span className={styles.themeCaption}>Preview theme</span>
          <SiteThemeToggle />
        </div>
      </div>
    </aside>
  );
}
