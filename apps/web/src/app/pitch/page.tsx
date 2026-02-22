import type { ComponentType } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "The Pitch — Your New Website",
  robots: { index: false, follow: false },
};

// ===== VISUAL MOCKUP COMPONENTS =====

function OldSiteVisual() {
  return (
    <div className={styles.browser}>
      <div className={styles.browserBar}>
        <div className={`${styles.browserDot} ${styles.browserDotRed}`} />
        <div className={`${styles.browserDot} ${styles.browserDotYellow}`} />
        <div className={`${styles.browserDot} ${styles.browserDotGreen}`} />
        <span className={styles.browserUrl}>chinaislandasiangrill.com/menu.asp</span>
      </div>
      <div className={`${styles.browserBody} ${styles.oldSite}`}>
        <div className={styles.oldSiteHeader}>CHINA ISLAND ASIAN GRILL</div>
        <div className={styles.oldSiteNav}>
          <span className={styles.oldSiteNavItem}>HOME</span>
          <span className={styles.oldSiteNavItem}>MENU</span>
          <span className={styles.oldSiteNavItem}>LOCATION</span>
          <span className={styles.oldSiteNavItem}>ABOUT</span>
        </div>
        <div className={styles.oldSiteBody}>
          <table className={styles.oldSiteTable}>
            <tbody>
              <tr>
                <td>Egg Roll (1)</td>
                <td className={styles.oldSitePrice}>$1.50</td>
              </tr>
              <tr>
                <td>Crab Rangoon (6)</td>
                <td className={styles.oldSitePrice}>$5.95</td>
              </tr>
              <tr>
                <td>Pot Stickers (6)</td>
                <td className={styles.oldSitePrice}>$6.95</td>
              </tr>
              <tr>
                <td>General Tso&apos;s Chicken</td>
                <td className={styles.oldSitePrice}>$10.95</td>
              </tr>
              <tr>
                <td>Orange Chicken</td>
                <td className={styles.oldSitePrice}>$10.95</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NewMenuVisual() {
  const categories = [
    "Soups", "Appetizers", "Fried Rice", "Noodles",
    "Favorites", "Traditional", "Specialties", "Lunch",
  ];
  const items = [
    { name: "General Tso\u2019s Chicken", price: "$12.95", active: true },
    { name: "Orange Chicken", price: "$12.95" },
    { name: "Kung Pao Chicken", price: "$11.95" },
    { name: "Sesame Chicken", price: "$12.95" },
    { name: "Mongolian Beef", price: "$13.95" },
    { name: "Sweet & Sour Chicken", price: "$10.95" },
  ];

  return (
    <div className={styles.browser}>
      <div className={styles.browserBar}>
        <div className={`${styles.browserDot} ${styles.browserDotRed}`} />
        <div className={`${styles.browserDot} ${styles.browserDotYellow}`} />
        <div className={`${styles.browserDot} ${styles.browserDotGreen}`} />
        <span className={styles.browserUrl}>chinaislandgrill.com/menu</span>
      </div>
      <div className={`${styles.browserBody} ${styles.menuMock}`}>
        <div className={styles.menuSidebar}>
          {categories.map((cat, i) => (
            <div
              key={cat}
              className={`${styles.menuCategoryItem} ${i === 4 ? styles.menuCategoryActive : ""}`}
            >
              {cat}
            </div>
          ))}
        </div>
        <div className={styles.menuCenter}>
          <div className={styles.menuCenterTitle}>Favorites</div>
          {items.map((item) => (
            <div
              key={item.name}
              className={`${styles.menuRow} ${item.active ? styles.menuRowActive : ""}`}
            >
              <span className={styles.menuItemName}>{item.name}</span>
              <span className={styles.menuItemPrice}>{item.price}</span>
            </div>
          ))}
        </div>
        <div className={styles.menuPreview}>
          <div className={styles.menuPreviewImage}>🍗</div>
          <div className={styles.menuPreviewTitle}>General Tso&apos;s Chicken</div>
          <div className={styles.menuPreviewDesc}>
            Crispy chicken tossed in a sweet-spicy glaze. Served with rice.
          </div>
          <div className={styles.menuPreviewPrice}>$12.95</div>
          <div className={styles.menuPreviewButton}>Add to Cart</div>
        </div>
      </div>
    </div>
  );
}

function CommissionVisual() {
  return (
    <div className={styles.commissionGrid}>
      <div className={`${styles.commissionCard} ${styles.commissionBad}`}>
        <div className={styles.commissionLabel}>Third Party</div>
        <div className={styles.commissionRow}>Order: $25.00</div>
        <div className={styles.commissionRow}>Commission: −$7.50</div>
        <div className={styles.commissionTotal}>You Keep: $17.50</div>
      </div>
      <div className={`${styles.commissionCard} ${styles.commissionGood}`}>
        <div className={styles.commissionLabel}>Your Site</div>
        <div className={styles.commissionRow}>Order: $25.00</div>
        <div className={styles.commissionRow}>Commission: $0.00</div>
        <div className={styles.commissionTotal}>You Keep: $25.00</div>
        <div className={styles.commissionSavings}>+$7.50 saved</div>
      </div>
    </div>
  );
}

function PhoneMockup() {
  const chips = ["Soups", "Apps", "Fried Rice", "Noodles", "Favs"];
  const items = [
    { name: "Hot & Sour Soup", price: "$3.95" },
    { name: "Wonton Soup", price: "$3.95" },
    { name: "Egg Drop Soup", price: "$2.95" },
    { name: "Miso Soup", price: "$3.50" },
    { name: "Seafood Soup", price: "$6.95" },
  ];

  return (
    <div className={styles.phone}>
      <div className={styles.phoneScreen}>
        <div className={styles.phoneStatusBar}>
          <div className={styles.phoneNotch} />
        </div>
        <div className={styles.phoneHeader}>
          <span className={styles.phoneHeaderTitle}>China Island</span>
          <span className={styles.phoneHeaderCart}>Cart (2)</span>
        </div>
        <div className={styles.phoneCategories}>
          {chips.map((chip, i) => (
            <span
              key={chip}
              className={`${styles.phoneChip} ${i === 0 ? styles.phoneChipActive : ""}`}
            >
              {chip}
            </span>
          ))}
        </div>
        <div className={styles.phoneItems}>
          {items.map((item) => (
            <div key={item.name} className={styles.phoneItem}>
              <span className={styles.phoneItemName}>{item.name}</span>
              <span className={styles.phoneItemPrice}>{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchResultsVisual() {
  return (
    <div className={styles.searchMock}>
      <div className={styles.searchBar}>
        <span className={styles.searchIcon} role="img" aria-label="Search">&#128269;</span>
        <span className={styles.searchQuery}>chinese food near me</span>
      </div>
      <div className={styles.searchResults}>
        <div className={`${styles.searchResult} ${styles.searchResultHighlight}`}>
          <span className={styles.searchResultUrl}>chinaislandgrill.com</span>
          <span className={styles.searchResultTitle}>
            China Island Asian Grill — Menu & Online Ordering
          </span>
          <span className={styles.searchResultDesc}>
            Fresh Asian cuisine. 114 menu items. Order online for pickup.
            Mon–Sat 11am–9pm, Sun 12pm–8pm.
          </span>
        </div>
        <div className={styles.searchResult}>
          <span className={styles.searchResultUrl}>chinaislandgrill.com/menu</span>
          <span className={styles.searchResultTitle}>
            Full Menu — China Island Asian Grill
          </span>
          <span className={styles.searchResultDesc}>
            Soups, appetizers, fried rice, noodles, house favorites, lunch specials & more. View prices and order online.
          </span>
        </div>
      </div>
    </div>
  );
}

function CMSVisual() {
  return (
    <div className={styles.browser}>
      <div className={styles.browserBar}>
        <div className={`${styles.browserDot} ${styles.browserDotRed}`} />
        <div className={`${styles.browserDot} ${styles.browserDotYellow}`} />
        <div className={`${styles.browserDot} ${styles.browserDotGreen}`} />
        <span className={styles.browserUrl}>chinaisland.sanity.studio</span>
      </div>
      <div className={`${styles.browserBody} ${styles.cmsMock}`}>
        <div className={styles.cmsSidebar}>
          <span className={`${styles.cmsTab} ${styles.cmsTabActive}`}>Menu Items</span>
          <span className={styles.cmsTab}>Categories</span>
          <span className={styles.cmsTab}>Modifiers</span>
        </div>
        <div className={styles.cmsBody}>
          <div className={styles.cmsField}>
            <span className={styles.cmsLabel}>Item Name</span>
            <span className={styles.cmsInput}>General Tso&apos;s Chicken</span>
          </div>
          <div className={styles.cmsRow}>
            <div className={styles.cmsField}>
              <span className={styles.cmsLabel}>Price</span>
              <span className={`${styles.cmsInput} ${styles.cmsInputPrice}`}>$12.95</span>
            </div>
            <div className={styles.cmsField}>
              <span className={styles.cmsLabel}>Category</span>
              <span className={styles.cmsInput}>Favorites</span>
            </div>
          </div>
          <div className={styles.cmsField}>
            <span className={styles.cmsLabel}>Description</span>
            <span className={styles.cmsInput}>Crispy chicken tossed in a sweet-spicy glaze</span>
          </div>
          <span className={styles.cmsSave}>Save & Publish</span>
        </div>
      </div>
    </div>
  );
}

function PaymentFlowVisual() {
  return (
    <div className={styles.paymentFlow}>
      <div className={styles.paymentStep}>
        <div className={styles.paymentIcon} role="img" aria-label="Credit card">&#128179;</div>
        <div className={styles.paymentStepLabel}>Customer Pays</div>
        <div className={styles.paymentStepSub}>on your website</div>
      </div>
      <div className={styles.paymentArrow} aria-hidden="true">&rarr;</div>
      <div className={styles.paymentStep}>
        <div className={styles.paymentIcon} role="img" aria-label="Store">&#127978;</div>
        <div className={styles.paymentStepLabel}>Your Account</div>
        <div className={styles.paymentStepSub}>Stripe direct</div>
      </div>
      <div className={styles.paymentArrow} aria-hidden="true">&rarr;</div>
      <div className={styles.paymentStep}>
        <div className={styles.paymentIcon} role="img" aria-label="Bank">&#127974;</div>
        <div className={styles.paymentStepLabel}>Your Bank</div>
        <div className={styles.paymentStepSub}>direct deposit</div>
      </div>
    </div>
  );
}

// ===== FEATURE SECTION DATA =====

const featureSections: {
  id: string;
  alignment: "left" | "right";
  isDark: boolean;
  headline: string;
  copy: string;
  bullets: string[];
  Visual: ComponentType;
}[] = [
  {
    id: "menu",
    alignment: "left",
    isDark: false,
    headline: "Your entire menu. Every item. Every modifier.",
    copy: "All 114 items across 13 categories, organized the way your customers think about your food. Modifiers, spice levels, protein choices — it\u2019s all there. Searchable. Filterable. With a hover preview so customers can see what they\u2019re ordering.",
    bullets: [
      "114 items across 13 categories",
      "20 modifier groups (proteins, spice levels, sizes)",
      "Search and filter by name or category",
      "Desktop hover preview with descriptions and prices",
    ],
    Visual: NewMenuVisual,
  },
  {
    id: "ordering",
    alignment: "right",
    isDark: true,
    headline: "Take orders directly. Keep every dollar.",
    copy: "Third-party apps take 15\u201330% of every order. On a $25 order, that\u2019s up to $7.50 gone. When customers order from your site, the money goes to you. No middleman, no commission, no sharing your customer data.",
    bullets: [
      "Zero commission on direct orders",
      "Persistent cart — customers can browse and come back",
      "Modifier customization at checkout",
      "Tax calculated automatically (8.25%)",
    ],
    Visual: CommissionVisual,
  },
  {
    id: "mobile",
    alignment: "left",
    isDark: false,
    headline: "Works on every phone your customers have.",
    copy: "Most of your customers will find you on their phone. The menu adapts automatically — horizontal category chips, single-column layout, slide-in cart drawer. No pinching, no zooming, no squinting at tiny text.",
    bullets: [
      "Responsive from 320px phones to 4K desktops",
      "Touch-friendly cart and checkout",
      "Mobile menu drawer with swipe support",
      "Loads fast on cellular connections",
    ],
    Visual: PhoneMockup,
  },
  {
    id: "seo",
    alignment: "right",
    isDark: true,
    headline: "Show up when people search \u2018Chinese food near me.\u2019",
    copy: "Right now, when someone searches for Chinese food in your area, they might never find you. Your new site has structured data that tells Google exactly what you serve, where you are, and when you\u2019re open.",
    bullets: [
      "JSON-LD structured data (Restaurant schema)",
      "XML sitemap for all pages",
      "Canonical URLs to prevent duplicate content",
      "Open Graph tags for social media sharing",
    ],
    Visual: SearchResultsVisual,
  },
  {
    id: "cms",
    alignment: "left",
    isDark: false,
    headline: "Change a price in ten seconds. No developer needed.",
    copy: "Seasonal special? Price increase? 86\u2019d an item? Log into the dashboard, make the change, hit publish. Every page on your site updates instantly. The menu, the checkout, everything.",
    bullets: [
      "Sanity CMS — edit menu items, prices, descriptions",
      "Changes go live immediately",
      "Add or remove items and categories",
      "Local data fallback if CMS is ever down",
    ],
    Visual: CMSVisual,
  },
  {
    id: "payments",
    alignment: "right",
    isDark: true,
    headline: "Payments go straight to your bank account.",
    copy: "Stripe handles the payment processing — the most trusted platform in the industry. Customers pay on your site, the money deposits directly to your bank. No shared pools, no waiting, no confusion.",
    bullets: [
      "Stripe payment processing — secure and PCI-compliant",
      "Direct deposit to your bank account",
      "Automatic webhook handling for order confirmation",
      "Full transaction history and reporting",
    ],
    Visual: PaymentFlowVisual,
  },
];

function FeatureSection({
  id,
  alignment,
  headline,
  copy,
  bullets,
  Visual,
  isDark,
}: {
  id: string;
  alignment: "left" | "right";
  headline: string;
  copy: string;
  bullets: string[];
  Visual: ComponentType;
  isDark: boolean;
}) {
  return (
    <section
      id={id}
      className={`${styles.section} ${isDark ? styles.sectionDark : ""}`}
    >
      <div
        className={`${styles.sectionInner} ${
          alignment === "right" ? styles.sectionReversed : ""
        }`}
      >
        <div className={styles.sectionCopy}>
          <h2 className={styles.headline}>{headline}</h2>
          <p className={styles.description}>{copy}</p>
          {bullets.length > 0 && (
            <ul className={styles.bullets}>
              {bullets.map((bullet) => (
                <li key={bullet} className={styles.bullet}>
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.sectionVisual}>
          <Visual />
        </div>
      </div>
    </section>
  );
}

// ===== CHECKLIST =====

const liveItems = [
  "Full interactive menu (114 items)",
  "13 menu categories",
  "20 modifier groups",
  "Search and filter",
  "Shopping cart with persistence",
  "Checkout form",
  "Tax calculation (8.25%)",
  "Mobile responsive layout",
  "Loading skeletons",
  "Navigation progress bar",
  "SEO (sitemap, JSON-LD, robots)",
  "Open Graph social tags",
  "Sanity CMS integration",
  "Stripe API endpoints",
  "Accessibility (ARIA, keyboard)",
  "Sen custom typography",
];

const comingSoonItems = [
  "Live Stripe payments",
  "Order confirmation emails",
  "Customer accounts",
];

// ===== PAGE =====

export default function PitchPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroKicker}>China Island Asian Grill</span>
          <h1 className={styles.heroTitle}>
            Your food deserves a website that{" "}
            <span className={styles.heroTitleAccent}>works as hard as you do.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            A complete online presence — your full menu, online ordering,
            and a design that makes your food look as good as it tastes.
            Already built. Ready to go live.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>114</span>
              <span className={styles.statLabel}>Menu Items</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>13</span>
              <span className={styles.statLabel}>Categories</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>$0</span>
              <span className={styles.statLabel}>Commission</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section id="problem" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionCopy}>
            <h2 className={styles.headline}>
              Your current site can&apos;t take orders, doesn&apos;t work on phones,
              and Google barely knows it exists.
            </h2>
            <p className={styles.description}>
              The old site served its purpose. But customers today expect to browse
              a menu on their phone, add items to a cart, and check out — all
              without calling. If they can&apos;t, they order from somewhere else.
            </p>
          </div>
          <div className={styles.sectionVisual}>
            <OldSiteVisual />
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      {featureSections.map((section) => (
        <FeatureSection key={section.id} {...section} />
      ))}

      {/* Checklist */}
      <section className={styles.checklistSection}>
        <div className={styles.checklistHeader}>
          <h2 className={styles.checklistTitle}>
            This isn&apos;t a mockup. It&apos;s live code.
          </h2>
          <p className={styles.checklistSubtitle}>
            Everything with a checkmark is built and working today.
          </p>
        </div>
        <div className={styles.checklistGrid}>
          {liveItems.map((item) => (
            <div key={item} className={styles.checklistItem}>
              <span className={styles.checklistCheck}>&check;</span>
              <span>{item}</span>
            </div>
          ))}
          <div className={styles.checklistDivider}>
            <span className={styles.checklistDividerLabel}>Coming Soon</span>
            <div className={styles.checklistDividerLine} />
          </div>
          {comingSoonItems.map((item) => (
            <div key={item} className={`${styles.checklistItem} ${styles.checklistItemSoon}`}>
              <span className={styles.checklistCheck}>&middot;</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to see it live?</h2>
          <p className={styles.ctaSubtitle}>
            The site is built. Click below to walk through the full experience —
            menu, cart, checkout, everything.
          </p>
          <Link href="/menu" className={styles.ctaButton}>
            Explore the Menu &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
