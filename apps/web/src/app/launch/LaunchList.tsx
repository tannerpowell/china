'use client';

import { useState } from "react";
import styles from "./page.module.css";

type Status = "live" | "todo" | "owner";
type Filter = "all" | Status;

interface Item {
  text: string;
  note?: string;
  status: Status;
}

interface Group {
  heading: string;
  intro: string;
  items: Item[];
}

const groups: Group[] = [
  {
    heading: "Live on the site",
    intro: "Shipped and verified on chinaislandgrill.vercel.app.",
    items: [
      { text: "Full menu in HTML with real descriptions (56 of 118 items)", note: "The rest have no copy on the source site — nothing left to grab.", status: "live" },
      { text: "Menu renders server-side with styles at first paint", note: "No unstyled flash; verified 390–1440px.", status: "live" },
      { text: "Home category cards deep-link into menu sections", note: "/menu#soups etc., with scroll offset for the sticky header.", status: "live" },
      { text: "Location Info page: phone, address, hours above the fold", note: "Apple + Google Maps buttons, embedded map, pickup/delivery times.", status: "live" },
      { text: "Restaurant JSON-LD: address, hours, cuisines, price range", status: "live" },
      { text: "Menu + MenuItem schema block for AI/dish search", note: "All 118 items; prices where set, descriptions where available, vegetarian flags.", status: "live" },
      { text: "BreadcrumbList schema on menu, order, location", note: "Home excluded — a single-item trail isn't a valid breadcrumb.", status: "live" },
      { text: "Custom 404 page", note: "On-brand, links to home, menu, order, location.", status: "live" },
      { text: "FAQ content + FAQPage schema on /location", status: "live" },
      { text: "Favicon / touch icon / social share image wired", note: "Currently the logo — swap in food photography when available.", status: "live" },
      { text: "robots.txt, sitemap.xml, per-page canonical URLs", status: "live" },
      { text: "Analytics placeholder (renders only when an ID is set)", status: "live" },
      { text: "Owner CMS at /studio (menu, prices, descriptions, tags)", note: "Needs the two Sanity dashboard steps below before login works. Re-imports overwrite owner edits on managed fields — backup + approval first (see docs).", status: "live" },
      { text: "Atomic Sanity/local fallback (never a mixed menu)", note: "Empty or inconsistent datasets fall back to the bundled menu.", status: "live" },
      { text: "Preview builds opt-in via [preview] in the subject", status: "live" },
    ],
  },
  {
    heading: "Site work remaining",
    intro: "Ours to do before or just after go-live.",
    items: [
      { text: "OrderAction schema for the online ordering flow", status: "todo" },
      { text: "AggregateRating schema once a review feed is chosen", note: "Needs a review source (GBP API or manual).", status: "todo" },
      { text: "Sitewide footer with NAP on every page", note: "Design call — home/menu currently have no footer.", status: "todo" },
      { text: "Homepage H1 carries cuisine + city", note: "Currently brand only; SEO best practice wants the keyword.", status: "todo" },
      { text: "Food photography + descriptive alt text", note: "Signature dishes, dining room, storefront.", status: "todo" },
      { text: "Catering page (menu already has catering options)", note: "Placeholder route until the owner confirms details.", status: "todo" },
      { text: "Stripe apiVersion verified in test mode (non-mutating request, no charge)", note: "tsc/build can't prove the pinned version is accepted. Gate before go-live.", status: "todo" },
    ],
  },
  {
    heading: "Owner / external setup",
    intro: "Needs the owner's accounts, logins, or decisions. Can't be done from the repo.",
    items: [
      { text: "Claim + verify Google Business Profile", note: "NAP, hours, categories, photos, menu link → /menu, order link → /order.", status: "owner" },
      { text: "GBP upkeep habit: photos, posts, review replies", note: "Posts weekly; reply to every review within 72h.", status: "owner" },
      { text: "Apple Maps + Bing Places + Yelp + TripAdvisor listings", note: "NAP identical everywhere.", status: "owner" },
      { text: "Sanity: invite owner as Editor + add site CORS origin", note: "See docs/sanity-setup.md. Blocks /studio login.", status: "owner" },
      { text: "Google Analytics account + ID in Vercel env", status: "owner" },
      { text: "Google Search Console: verify + submit sitemap", status: "owner" },
      { text: "Holiday-hours process (who updates GBP + site)", status: "owner" },
    ],
  },
];
const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "todo", label: "To do" },
  { id: "owner", label: "Owner" },
];

const statusLabel: Record<Status, string> = {
  live: "Live",
  todo: "To do",
  owner: "Owner",
};

export default function LaunchList() {
  const [filter, setFilter] = useState<Filter>("all");

  const visibleGroups = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => filter === "all" || item.status === filter),
    }))
    .filter((g) => g.items.length > 0);

  const counts = (id: Filter) =>
    id === "all"
      ? groups.reduce((n, g) => n + g.items.length, 0)
      : groups.reduce((n, g) => n + g.items.filter((i) => i.status === id).length, 0);

  return (
    <>
      <div className={styles.chips} role="group" aria-label="Filter checklist">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`${styles.chip} ${filter === f.id ? styles.chipActive : ""}`}
          >
            {f.label} · {counts(f.id)}
          </button>
        ))}
      </div>

      {visibleGroups.map((g) => (
        <section key={g.heading} className={styles.group}>
          <h2 className={styles.groupTitle}>{g.heading}</h2>
          <p className={styles.groupIntro}>{g.intro}</p>
          <ul className={styles.list}>
            {g.items.map((item) => (
              <li key={item.text} className={styles.item}>
                <span className={`${styles.pill} ${styles[item.status]}`}>
                  {statusLabel[item.status]}
                </span>
                <div>
                  <p className={styles.itemText}>{item.text}</p>
                  {item.note && <p className={styles.itemNote}>{item.note}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
