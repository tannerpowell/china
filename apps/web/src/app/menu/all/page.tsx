import type { Metadata } from "next";
import Link from "next/link";
import { getAllMenuData } from "@/lib/menu-sanity";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/schema";
import { SiteSidebar } from "@/components/SiteSidebar";
import {
  restaurant,
  restaurantPhoneHref,
} from "@/lib/restaurant";
import { SectionNav } from "./SectionNav";
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
  const { categories, items } = await getAllMenuData();

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  const sections = sorted.map((category, i) => ({
    category,
    number: String(i + 1).padStart(2, "0"),
    items: items
      .filter((item) => item.categoryId === category.id)
      .sort((a, b) => b.likes - a.likes),
  }));

  const orderUrl =
    process.env.NEXT_PUBLIC_ORDER_CART_URL ??
    "https://us.chinesemenu.com/order/shoppingcart.htm";

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
      <SectionNav
        sections={sections.map((s) => ({
          slug: s.category.slug,
          title: s.category.title,
          count: s.items.length,
        }))}
        items={items.map((item) => {
          const section = sorted.find((c) => c.id === item.categoryId);
          return {
            slug: item.slug,
            name: item.name,
            sectionSlug: section?.slug ?? "",
            sectionTitle: section?.title ?? "",
            price: item.basePrice !== null ? formatPrice(item.basePrice) : null,
            description: item.description,
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
            <h1 className={styles.title}>The Full Menu</h1>
            <p className={styles.lede}>
              Every dish, start to finish — {items.length} items across{" "}
              {sections.length} sections. Scroll, or jump straight to a
              craving.
            </p>
            <div className={styles.ctaRow}>
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaPrimary}
              >
                Order Online
              </a>
              <a href={restaurantPhoneHref} className={styles.ctaSecondary}>
                Call {restaurant.phoneDisplay}
              </a>
            </div>
            <p className={styles.legend}>
              <span title="Spicy">🌶 spicy</span>
              <span aria-hidden="true">·</span>
              <span title="Vegetarian">🌱 vegetarian</span>
              <span aria-hidden="true">·</span>
              <span title="Popular">★ house favorite</span>
              <span aria-hidden="true">·</span>
              <span title="Market price">MP market price</span>
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
                    Section {number} · {sectionItems.length}{" "}
                    {sectionItems.length === 1 ? "dish" : "dishes"}
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
                          <span className={styles.mp}>MP</span>
                        )}
                      </span>
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
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaPrimary}
              >
                Order Online
              </a>
              <Link href="/menu" className={styles.ctaSecondary}>
                Interactive Menu
              </Link>
            </div>
            <p className={styles.footerLinks}>
              <Link href="/">Home</Link>
              <span aria-hidden="true">·</span>
              <Link href="/location">Location Info</Link>
              <span aria-hidden="true">·</span>
              <a href="#top">Back to top ↑</a>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
