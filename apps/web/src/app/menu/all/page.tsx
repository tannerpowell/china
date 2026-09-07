import type { Metadata } from "next";
import Link from "next/link";
import { getAllMenuData } from "@/lib/menu-sanity";
import { JsonLd } from "@/components/JsonLd";
import { T } from "@/components/T";
import { breadcrumbJsonLd } from "@/lib/schema";
import { SiteSidebar } from "@/components/SiteSidebar";
import {
  restaurant,
  restaurantPhoneHref,
} from "@/lib/restaurant";
import { SectionNav } from "./SectionNav";
import { DishOrderProvider, DishAddButton } from "./DishOrder";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Full Menu",
  description:
    "The complete China Island Asian Grill menu on one page. Soups, appetizers, fried rice, noodles, house favorites, chef's specials and more — Flower Mound, TX.",
  alternates: { canonical: "/menu/all" },
};

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

export default async function FullMenuPage() {
  const { categories, items, modifierGroups } = await getAllMenuData();

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  const modById = new Map(modifierGroups.map((g) => [g.id, g]));
  // Protein-bearing modifier groups: searching "chicken" should find dishes
  // where chicken is a choice even when the name doesn't say so. Prep groups
  // (sauce, spice, rice, style) are excluded to keep results tight.
  const proteinRe = /main-ingredient|additional-protein|entree/i;
  const sections = sorted.map((category, i) => ({
    category,
    number: String(i + 1).padStart(2, "0"),
    items: items
      .filter((item) => item.categoryId === category.id)
      .sort((a, b) => b.likes - a.likes),
  }));

  // All ordering stays in-house: the CTAs below route to /order
  // (cart + checkout).

  return (
    <div className={styles.layout} id="top">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Menu", path: "/menu" },
          { name: "Full Menu" },
        ])}
      />
      <SiteSidebar active="menu" />

      <div className={styles.rightPanel}>
        <DishOrderProvider
          categories={sorted}
          modifierGroups={modifierGroups}
        >
        <SectionNav
        sections={sections.map((s) => ({
          slug: s.category.slug,
          title: s.category.title,
          count: s.items.length,
        }))}
        items={items.map((item) => {
          const section = sorted.find((c) => c.id === item.categoryId);
          const proteins = item.modifierGroupIds
            .filter((gid) => proteinRe.test(gid))
            .flatMap(
              (gid) => modById.get(gid)?.options.map((o) => o.label) ?? []
            );
          return {
            slug: item.slug,
            name: item.name,
            sectionSlug: section?.slug ?? "",
            sectionTitle: section?.title ?? "",
            price: item.basePrice !== null ? formatPrice(item.basePrice) : null,
            description: item.description,
            searchText: [
              item.name,
              item.description ?? "",
              section?.title ?? "",
              ...proteins,
            ]
              .join(" ")
              .toLowerCase(),
          };
        })}
      />

        <main className={styles.main}>
          {/* Masthead */}
          <header className={styles.masthead}>
            <p className={styles.eyebrow}>
              {restaurant.name} · {restaurant.addressCity},{" "}
              {restaurant.addressRegion}
            </p>
            <h1 className={styles.title}><T id="all.title" /></h1>
            <p className={styles.lede}>
              <T id="all.lede" vars={{ n: items.length, s: sections.length }} />
            </p>
            <div className={styles.ctaRow}>
              <Link href="/order" className={styles.ctaPrimary}>
                <T id="all.orderCta" />
              </Link>
              <a href={restaurantPhoneHref} className={styles.ctaSecondary}>
                <T id="all.callCta" /> {restaurant.phoneDisplay}
              </a>
            </div>
            <p className={styles.legend}>
              <span title="Spicy">🌶 <T id="all.spicy" /></span>
              <span aria-hidden="true">·</span>
              <span title="Vegetarian">🌱 <T id="all.veg" /></span>
              <span aria-hidden="true">·</span>
              <span title="Popular">★ <T id="all.pop" /></span>
              <span aria-hidden="true">·</span>
              <span title="Market price">MP <T id="all.mpFull" /></span>
            </p>
          </header>

          {/* Sections */}
          {sections.map(({ category, number, items: sectionItems }) => (
            <section
              key={category.id}
              id={category.slug}
              className={styles.section}
              aria-labelledby={`${category.slug}-heading`}
            >
              <div className={styles.sectionHead}>
                <span className={styles.sectionNumber} aria-hidden="true">
                  {number}
                </span>
                <div>
                  <p className={styles.sectionEyebrow}>
                    <T
                      id="all.sectionLine"
                      vars={{ num: number, n: sectionItems.length }}
                    />
                  </p>
                  <h2
                    id={`${category.slug}-heading`}
                    className={styles.sectionTitle}
                  >
                    {category.title}
                  </h2>
                </div>
              </div>

              <ul className={styles.dishes}>
              {sectionItems.map((item) => (
                <li key={item.id} id={`dish-${item.slug}`} className={styles.dish}>
                    <div className={styles.dishTop}>
                      <h3 className={styles.dishName}>
                        {item.name}
                        <span className={styles.badges}>
                          {item.tags.spicy && (
                            <span title="Spicy" role="img" aria-label="Spicy">
                              🌶
                            </span>
                          )}
                          {item.tags.vegetarian && (
                            <span
                              title="Vegetarian"
                              role="img"
                              aria-label="Vegetarian"
                            >
                              🌱
                            </span>
                          )}
                          {item.tags.popular && (
                            <span
                              className={styles.star}
                              title="House favorite"
                              role="img"
                              aria-label="House favorite"
                            >
                              ★
                            </span>
                          )}
                        </span>
                      </h3>
                    <span className={styles.leader} aria-hidden="true" />
                    <span className={styles.price}>
                      {item.basePrice !== null ? (
                        formatPrice(item.basePrice)
                      ) : (
                        <T id="menu.mp" />
                      )}
                    </span>
                    <DishAddButton item={item} />
                    </div>
                    {item.description && (
                      <p className={styles.dishDescription}>
                        {item.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* Footer */}
          <footer className={styles.footer}>
            <div className={styles.ctaRow}>
              <Link href="/order" className={styles.ctaPrimary}>
                <T id="all.orderCta" />
              </Link>
              <Link href="/menu" className={styles.ctaSecondary}>
                <T id="all.interactive" />
              </Link>
            </div>
            <p className={styles.footerLinks}>
              <Link href="/"><T id="all.home" /></Link>
              <span aria-hidden="true">·</span>
              <Link href="/location"><T id="nav.visit" /></Link>
              <span aria-hidden="true">·</span>
              <a href="#top"><T id="all.top" /></a>
            </p>
          </footer>
        </main>
        </DishOrderProvider>
      </div>
    </div>
  );
}
