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
    heading: "Completed",
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
      { text: "Order button in Google search results (OrderAction markup)", note: "Behind-the-scenes code that lets Google show e.g. “Order pickup” next to our listing, straight into /order.", status: "todo" },
      { text: "Star rating in Google search results, once a review source is chosen", note: "Needs a review source: Google Business Profile reviews, or ratings entered by hand. Lets Google show e.g. ★ 4.8 next to our listing.", status: "todo" },
      { text: "Same name, address, and phone number in a footer on every page", note: "Search engines call this trio “NAP”. They trust us more when it matches everywhere — design call, home/menu currently have no footer.", status: "todo" },
      { text: "Homepage main heading names the cuisine + city", note: "Currently brand only. The heading (called an “H1”) should read something like “Chinese Restaurant in Flower Mound” — that's the phrase people search.", status: "todo" },
      { text: "Food photography + plain-English description on each photo", note: "Signature dishes, dining room, storefront. The attached description (called “alt text”) is what Google reads — e.g. “Kung Pao Chicken over steamed rice”.", status: "todo" },
      { text: "Catering page (menu already has catering options)", note: "Placeholder route until the owner confirms details.", status: "todo" },
      { text: "Safe Stripe version check in test mode", note: "Confirms Stripe accepts our connection settings with a no-charge test request. Required before real payments.", status: "todo" },
    ],
  },
  {
    heading: "Owner / external setup",
    intro: "Needs the owner's accounts, logins, or decisions. Can't be done from the repo.",
    items: [
      { text: "Claim + verify Google Business Profile", note: "Name, address, phone (the “NAP” trio), hours, categories, photos, menu link → /menu, order link → /order.", status: "owner" },
      { text: "Google Business Profile upkeep habit: photos, posts, review replies", note: "Posts weekly; reply to every review within 72h.", status: "owner" },
      { text: "Apple Maps + Bing Places + Yelp + TripAdvisor listings", note: "Name, address, and phone identical everywhere — mismatches hurt search ranking.", status: "owner" },
      { text: "Content system access: invite owner as Editor + approve our website", note: "Sanity (where menu edits happen) only talks to approved sites — ours must be on its list. See docs/sanity-setup.md. Blocks /studio login.", status: "owner" },
      { text: "Google Analytics account + ID added to the hosting settings", status: "owner" },
      { text: "Google Search Console: prove ownership + hand Google our page list", note: "Verification proves the site is ours; submitting the sitemap (the full page list) gets every page found faster.", status: "owner" },
      { text: "Holiday-hours process (who updates Google + site)", status: "owner" },
    ],
  },
];
const filters: { id: Filter; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "owner", label: "Owner" },
  { id: "live", label: "Completed" },
  { id: "all", label: "All" },
];

const statusLabel: Record<Status, string> = {
  live: "Completed",
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
