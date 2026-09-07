import Image from "next/image";
import Link from "next/link";
import {
  restaurant,
  restaurantHoursShort,
  restaurantPhoneHref,
} from "@/lib/restaurant";
import { SiteThemeToggle } from "./SiteThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { T } from "./T";
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
        <Link href="/" aria-label="China Island Asian Grill — home">
          <Image
            src="/logo.png"
            alt="China Island Asian Grill"
            className={styles.logo}
            width={200}
            height={200}
            priority
          />
        </Link>
        <h1 className={styles.title}>China Island</h1>
        <p className={styles.subtitle}>Asian Grill</p>

        <nav className={styles.nav}>
          <Link
            href="/menu"
            className={`${styles.navLink} ${active === "menu" ? styles.navLinkActive : ""}`}
          >
            <T id="nav.menu" />
          </Link>
          <Link
            href="/menu"
            className={`${styles.navLink} ${active === "order" ? styles.navLinkActive : ""}`}
          >
            <T id="nav.order" />
          </Link>
          <Link
            href="/location"
            className={`${styles.navLink} ${active === "visit" ? styles.navLinkActive : ""}`}
          >
            <T id="nav.visit" />
          </Link>
        </nav>

        <p className={styles.blurb}>
          <T id="nav.blurb" />
          <br /><br />
          <a href={restaurantPhoneHref} className={styles.aboutLink}><T id="nav.call" />: {phone}</a>
        </p>

        <div className={styles.hours}>
          <strong><T id="nav.hours" /></strong><br />
          {restaurantHoursShort.map((row) => (
            <span key={row.days} className={styles.hoursRow}>
              {row.days.startsWith("Sun") ? <T id="hours.sunThu" /> : <T id="hours.friSat" />}: {row.time}
            </span>
          ))}
        </div>

        <div className={styles.prefsRow}>
          <div className={styles.prefGroup}>
            <span className={styles.themeCaption}><T id="nav.theme" /></span>
            <SiteThemeToggle />
          </div>
          <div className={styles.prefGroup}>
            <span className={styles.themeCaption}><T id="nav.lang" /></span>
            <LanguageToggle compact />
          </div>
        </div>
      </div>
    </aside>
  );
}
