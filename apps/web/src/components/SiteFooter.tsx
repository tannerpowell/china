import Link from "next/link";
import { T } from "./T";
import {
  restaurant,
  restaurantAddressFull,
  restaurantDirectionsUrl,
  restaurantHoursShort,
  restaurantPhoneHref,
} from "@/lib/restaurant";
import styles from "./SiteFooter.module.css";

// Slim scroll-to footer: NAP (name/address/phone) + key links + hours.
// NAP data (names, street, numbers) always renders English — only the
// small labels translate. Previewed on owner pages first; public rollout
// (home/menu) is the open design call on /launch.
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.nap}>
          <strong>{restaurant.name}</strong>
          <span aria-hidden="true">·</span>
          <a
            href={restaurantDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {restaurantAddressFull}
          </a>
          <span aria-hidden="true">·</span>
          <a href={restaurantPhoneHref}>{restaurant.phoneDisplay}</a>
        </div>
        <nav className={styles.links} aria-label="Footer">
          <Link href="/menu">
            <T id="nav.menu" />
          </Link>
          <Link href="/order">
            <T id="nav.order" />
          </Link>
          <Link href="/location">
            <T id="nav.visit" />
          </Link>
          <span className={styles.hours}>
            <T id="nav.hours" />:{" "}
            {restaurantHoursShort
              .map((row) => `${row.days} ${row.time}`)
              .join(" · ")}
          </span>
        </nav>
      </div>
    </footer>
  );
}
