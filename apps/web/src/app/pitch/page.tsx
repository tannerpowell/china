import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { translations, type Locale, type Translations, type FeatureId } from "./translations";
import { LanguageToggle } from "./LanguageToggle";
import styles from "./page.module.css";

type SearchParams = Promise<{ lang?: string }>;

export async function generateMetadata(props: { searchParams: SearchParams }): Promise<Metadata> {
  const { lang } = await props.searchParams;
  const locale: Locale = lang === 'zh' ? 'zh' : 'en';
  return {
    title: translations[locale].meta.title,
    robots: { index: false, follow: false },
  };
}

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

function CommissionVisual({ t }: { t: Translations['commission'] }) {
  return (
    <div className={styles.commissionGrid}>
      <div className={`${styles.commissionCard} ${styles.commissionBad}`}>
        <div className={styles.commissionLabel}>{t.badLabel}</div>
        <div className={styles.commissionRow}>{t.order}</div>
        <div className={styles.commissionRow}>{t.badFee}</div>
        <div className={styles.commissionTotal}>{t.badKeep}</div>
      </div>
      <div className={`${styles.commissionCard} ${styles.commissionGood}`}>
        <div className={styles.commissionLabel}>{t.goodLabel}</div>
        <div className={styles.commissionRow}>{t.order}</div>
        <div className={styles.commissionRow}>{t.goodFee}</div>
        <div className={styles.commissionTotal}>{t.goodKeep}</div>
        <div className={styles.commissionSavings}>{t.savings}</div>
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

function SearchResultsVisual({ t }: { t: Translations['search'] }) {
  return (
    <div className={styles.searchMock}>
      <div className={styles.searchBar}>
        <span className={styles.searchIcon} role="img" aria-label="Search">&#128269;</span>
        <span className={styles.searchQuery}>{t.query}</span>
      </div>
      <div className={styles.searchResults}>
        <div className={`${styles.searchResult} ${styles.searchResultHighlight}`}>
          <span className={styles.searchResultUrl}>chinaislandgrill.com</span>
          <span className={styles.searchResultTitle}>{t.result1Title}</span>
          <span className={styles.searchResultDesc}>{t.result1Desc}</span>
        </div>
        <div className={styles.searchResult}>
          <span className={styles.searchResultUrl}>chinaislandgrill.com/menu</span>
          <span className={styles.searchResultTitle}>{t.result2Title}</span>
          <span className={styles.searchResultDesc}>{t.result2Desc}</span>
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

function PaymentFlowVisual({ t }: { t: Translations['payment'] }) {
  return (
    <div className={styles.paymentFlow}>
      <div className={styles.paymentStep}>
        <div className={styles.paymentIcon} role="img" aria-label="Credit card">&#128179;</div>
        <div className={styles.paymentStepLabel}>{t.step1Label}</div>
        <div className={styles.paymentStepSub}>{t.step1Sub}</div>
      </div>
      <div className={styles.paymentArrow} aria-hidden="true">&rarr;</div>
      <div className={styles.paymentStep}>
        <div className={styles.paymentIcon} role="img" aria-label="Store">&#127978;</div>
        <div className={styles.paymentStepLabel}>{t.step2Label}</div>
        <div className={styles.paymentStepSub}>{t.step2Sub}</div>
      </div>
      <div className={styles.paymentArrow} aria-hidden="true">&rarr;</div>
      <div className={styles.paymentStep}>
        <div className={styles.paymentIcon} role="img" aria-label="Bank">&#127974;</div>
        <div className={styles.paymentStepLabel}>{t.step3Label}</div>
        <div className={styles.paymentStepSub}>{t.step3Sub}</div>
      </div>
    </div>
  );
}

// ===== FEATURE VISUAL MAP =====

// Returns a rendered element (not a component factory) so the visuals keep
// stable component identities across renders instead of remounting each time.
function getVisual(id: FeatureId, t: Translations): ReactNode {
  switch (id) {
    case 'menu':     return <NewMenuVisual />;
    case 'ordering': return <CommissionVisual t={t.commission} />;
    case 'mobile':   return <PhoneMockup />;
    case 'seo':      return <SearchResultsVisual t={t.search} />;
    case 'cms':      return <CMSVisual />;
    case 'payments': return <PaymentFlowVisual t={t.payment} />;
    default:         return null;
  }
}

const featureAlignments: Record<FeatureId, { alignment: 'left' | 'right'; isDark: boolean }> = {
  menu:     { alignment: 'left',  isDark: false },
  ordering: { alignment: 'right', isDark: true  },
  mobile:   { alignment: 'left',  isDark: false },
  seo:      { alignment: 'right', isDark: true  },
  cms:      { alignment: 'left',  isDark: false },
  payments: { alignment: 'right', isDark: true  },
};

function FeatureSection({
  id,
  alignment,
  headline,
  copy,
  bullets,
  visual,
  isDark,
}: {
  id: FeatureId;
  alignment: 'left' | 'right';
  headline: string;
  copy: string;
  bullets: readonly string[];
  visual: ReactNode;
  isDark: boolean;
}) {
  return (
    <section
      id={id}
      className={`${styles.section} ${isDark ? styles.sectionDark : ''}`}
    >
      <div
        className={`${styles.sectionInner} ${
          alignment === 'right' ? styles.sectionReversed : ''
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
        <div className={styles.sectionVisual} aria-hidden="true">
          {visual}
        </div>
      </div>
    </section>
  );
}

// ===== PAGE =====

export default async function PitchPage(props: { searchParams: SearchParams }) {
  const { lang } = await props.searchParams;
  const locale: Locale = lang === 'zh' ? 'zh' : 'en';
  const t = translations[locale];

  return (
    <div className={styles.page}>
      {/* Language toggle — fixed position */}
      <LanguageToggle locale={locale} />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroKicker}>{t.hero.kicker}</span>
          <h1 className={styles.heroTitle}>
            {t.hero.titleLine1}{' '}
            <span className={styles.heroTitleAccent}>{t.hero.titleAccent}</span>
          </h1>
          <p className={styles.heroSubtitle}>{t.hero.subtitle}</p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{t.hero.stats.items.value}</span>
              <span className={styles.statLabel}>{t.hero.stats.items.label}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{t.hero.stats.categories.value}</span>
              <span className={styles.statLabel}>{t.hero.stats.categories.label}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{t.hero.stats.commission.value}</span>
              <span className={styles.statLabel}>{t.hero.stats.commission.label}</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section id="problem" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionCopy}>
            <h2 className={styles.headline}>{t.problem.headline}</h2>
            <p className={styles.description}>{t.problem.description}</p>
          </div>
          <div className={styles.sectionVisual} aria-hidden="true">
            <OldSiteVisual />
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      {t.features.map((feature) => {
        const { alignment, isDark } = featureAlignments[feature.id];
        return (
          <FeatureSection
            key={feature.id}
            id={feature.id}
            alignment={alignment}
            isDark={isDark}
            headline={feature.headline}
            copy={feature.copy}
            bullets={feature.bullets}
            visual={getVisual(feature.id, t)}
          />
        );
      })}

      {/* Checklist */}
      <section className={styles.checklistSection}>
        <div className={styles.checklistHeader}>
          <h2 className={styles.checklistTitle}>{t.checklist.headline}</h2>
          <p className={styles.checklistSubtitle}>{t.checklist.subtitle}</p>
        </div>
        <div className={styles.checklistGrid}>
          {t.checklist.liveItems.map((item) => (
            <div key={item} className={styles.checklistItem}>
              <span className={styles.checklistCheck}>&check;</span>
              <span>{item}</span>
            </div>
          ))}
          <div className={styles.checklistDivider}>
            <span className={styles.checklistDividerLabel}>{t.checklist.soonLabel}</span>
            <div className={styles.checklistDividerLine} />
          </div>
          {t.checklist.soonItems.map((item) => (
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
          <h2 className={styles.ctaTitle}>{t.cta.headline}</h2>
          <p className={styles.ctaSubtitle}>{t.cta.subtitle}</p>
          <Link href="/menu" className={styles.ctaButton}>
            {t.cta.button}
          </Link>
        </div>
      </section>
    </div>
  );
}
