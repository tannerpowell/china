import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Go-Live Launch List",
  description: "Internal go-live checklist for the China Island Asian Grill website.",
  robots: { index: false, follow: false },
};

type Status = "live" | "todo" | "owner";

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
      { text: "FAQ content + FAQPage schema on /location", status: "live" },
      { text: "Favicon / touch icon / social share image wired", note: "Currently the logo — swap in food photography when available.", status: "live" },
      { text: "robots.txt, sitemap.xml, per-page canonical URLs", status: "live" },
      { text: "Analytics placeholder (renders only when an ID is set)", status: "live" },
      { text: "Owner CMS at /studio (menu, prices, descriptions, tags)", note: "Needs the two Sanity dashboard steps below before login works. Re-imports overwrite owner edits on managed fields — backup + approval first (see docs).", status: "live" },
      { text: "Preview builds opt-in via [preview] in the subject", status: "live" },
    ],
  },
  {
    heading: "Site work remaining",
    intro: "Ours to do before or just after go-live.",
    items: [
      { text: "Menu + MenuItem schema block for AI/dish search", note: "Names, prices, descriptions, diet flags for key dishes.", status: "todo" },
      { text: "BreadcrumbList schema on all pages", status: "todo" },
      { text: "OrderAction schema for the online ordering flow", status: "todo" },
      { text: "AggregateRating schema once a review feed is chosen", note: "Needs a review source (GBP API or manual).", status: "todo" },
      { text: "Sitewide footer with NAP on every page", note: "Design call — home/menu currently have no footer.", status: "todo" },
      { text: "Homepage H1 carries cuisine + city", note: "Currently brand only; SEO best practice wants the keyword.", status: "todo" },
      { text: "Food photography + descriptive alt text", note: "Signature dishes, dining room, storefront.", status: "todo" },
      { text: "Catering page (menu already has catering options)", note: "Placeholder route until the owner confirms details.", status: "todo" },
      { text: "Custom 404 page", status: "todo" },
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

const statusLabel: Record<Status, string> = {
  live: "Live",
  todo: "To do",
  owner: "Owner",
};

export default function LaunchPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          ← Back to Home
        </Link>
        <p className={styles.eyebrow}>Internal · not indexed</p>
        <h1 className={styles.title}>Go-Live Launch List</h1>
        <p className={styles.lede}>
          What&apos;s shipped, what&apos;s left, and what needs the
          owner — for the China Island Asian Grill site pitch and launch.
        </p>

        {groups.map((g) => (
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
      </div>
    </main>
  );
}
