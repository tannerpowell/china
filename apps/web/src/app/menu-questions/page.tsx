import type { Metadata } from "next";
import Link from "next/link";
import styles from "../launch/page.module.css";

export const metadata: Metadata = {
  title: "Menu Open Questions",
  description: "Internal list of unresolved menu content questions for the China Island Asian Grill site.",
  robots: { index: false, follow: false },
};

interface Question {
  q: string;
  detail?: string;
  owner: boolean;
}

interface Group {
  heading: string;
  intro: string;
  items: Question[];
}

const groups: Group[] = [
  {
    heading: "For the owner",
    intro: "Needs the owner's POS or policy answers before the site can mirror them.",
    items: [
      {
        q: "Which price should the site show for size variants?",
        detail:
          "Hot & Sour Soup (S $3.25 / L $6.00), Egg Drop Soup (S/L), Wonton Soup (S $4.00 / L $7.50), Steamed White & Brown Rice (S $2 / L $3), Plain Fried Rice (S $2 / L $3), Steamed Noodles (S $5.50 / L $9), Plain Lo Mein (S $5.50 / L $10), Steamed Vegetables (S $5.50 / L $10.50). Source lists both sizes; our items carry no size. POS decision: one price, both, or split items?",
        owner: true,
      },
      {
        q: "Which price for multi-protein Lettuce Wraps?",
        detail:
          "Source: Chicken $9.50 / Vegetarian $9.50 / Shrimp $10.50 on a single row. Same question as sizes — one price or split?",
        owner: true,
      },
      {
        q: "Supply copy for dishes with no description anywhere?",
        detail:
          "Neither their site nor ours describes: Basil Seafood Fried Rice, Shrimp with Snow Pea & Asparagus, Zhajiangmien Noodles, Eggplant Stir-Fry, Baby Bok Choy Stir-Fry, Broccoli Stir-Fry (veg), Home Style Tofu, and the non-Traditional catering variants. Owner writes them, or they stay blank?",
        owner: true,
      },
      {
        q: 'Does "NO SUBSTITUTIONS" cover vegetable swaps?',
        detail:
          "Traditional section header says comes with rice, no substitutions. Does that block swapping vegetables (e.g. mushrooms/peppers), or only the protein? Affects what the site should promise.",
        owner: true,
      },
    ],
  },
  {
    heading: "Our calls",
    intro: "Editorial decisions we can make without the owner. Recommendations included.",
    items: [
      {
        q: "Mirror full-size descriptions onto the 17 lunch (L) dupes?",
        detail:
          "Lunch items carry no copy on the source site. Recommendation: copy the matching full-size description — same dish, and it fills the lunch section for the AI/dish-search schema.",
        owner: false,
      },
      {
        q: "Clone sibling copy onto Vegetable Fried Rice?",
        detail:
          "Six of seven fried rices share one description; Vegetable has none. Recommendation: clone it — same base dish.",
        owner: false,
      },
      {
        q: "Keep our cleaned copy where it differs cosmetically from source?",
        detail:
          "Eight descriptions differ only in cleanup (prior “make”→“made” typo fix, stray ? / spacing in noodle and catering copy). Recommendation: keep ours.",
        owner: false,
      },
    ],
  },
];

export default function MenuQuestionsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/launch" className={styles.backLink}>
          ← Back to Launch List
        </Link>
        <p className={styles.eyebrow}>Internal · not indexed</p>
        <h1 className={styles.title}>Menu Open Questions</h1>
        <p className={styles.lede}>
          Everything the site can&apos;t mirror from the official menu on its
          own — who answers it, and what we recommend where it&apos;s our
          call.
        </p>

        {groups.map((g) => (
          <section key={g.heading} className={styles.group}>
            <h2 className={styles.groupTitle}>{g.heading}</h2>
            <p className={styles.groupIntro}>{g.intro}</p>
            <ul className={styles.list}>
              {g.items.map((item) => (
                <li key={item.q} className={styles.item}>
                  <span
                    className={`${styles.pill} ${
                      item.owner ? styles.owner : styles.todo
                    }`}
                  >
                    {item.owner ? "Owner" : "Us"}
                  </span>
                  <div>
                    <p className={styles.itemText}>{item.q}</p>
                    {item.detail && (
                      <p className={styles.itemNote}>{item.detail}</p>
                    )}
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
