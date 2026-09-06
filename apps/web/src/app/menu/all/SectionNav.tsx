'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

interface NavSection {
  slug: string;
  title: string;
  count: number;
}

export interface SearchItem {
  slug: string;
  name: string;
  sectionSlug: string;
  sectionTitle: string;
  price: string | null;
  description: string | null;
}

/**
 * Sticky anchor nav with scroll-spy, an overflow caret, and search.
 * Plain hash links do the section navigating (works with no JS); the
 * observer only paints the active state. The caret and search are
 * progressive enhancement on top.
 */
export function SectionNav({
  sections,
  items,
}: {
  sections: NavSection[];
  items: SearchItem[];
}) {
  const [active, setActive] = useState<string>("");
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const trackRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    for (const s of sections) {
      const el = document.getElementById(s.slug);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 8);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return items
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description?.toLowerCase().includes(q) ?? false)
      )
      .slice(0, 30);
  }, [query, items]);

  function jumpTo(item: SearchItem) {
    setSearchOpen(false);
    setQuery("");
    requestAnimationFrame(() => {
      const el = document.getElementById(`dish-${item.slug}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add(styles.dishFlash);
      window.setTimeout(() => el.classList.remove(styles.dishFlash), 1800);
    });
  }

  function scrollTrack() {
    trackRef.current?.scrollBy({ left: 240, behavior: "smooth" });
  }

  return (
    <>
      <nav className={styles.nav} aria-label="Menu sections">
        <div className={styles.navInner}>
          <a href="#top" className={styles.navBrand}>
            Full Menu
          </a>
          <div className={styles.navTrackWrap}>
            <div ref={trackRef} className={styles.navLinks}>
              {sections.map((s) => (
                <a
                  key={s.slug}
                  href={`#${s.slug}`}
                  aria-current={active === s.slug ? "location" : undefined}
                  className={`${styles.navLink} ${
                    active === s.slug ? styles.navLinkActive : ""
                  }`}
                >
                  {s.title}
                  <span className={styles.navCount}>{s.count}</span>
                </a>
              ))}
            </div>
            {canScrollRight && (
              <button
                type="button"
                onClick={scrollTrack}
                className={styles.navCaret}
                aria-label="Show more sections"
                title="More sections"
              >
                <span aria-hidden="true">›</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={styles.navSearch}
            aria-label="Search the menu"
            title="Search the menu"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </button>
        </div>
      </nav>

      {searchOpen && (
        <div
          className={styles.searchBackdrop}
          onClick={() => {
            setSearchOpen(false);
            setQuery("");
          }}
        >
          <div
            className={styles.searchDialog}
            role="dialog"
            aria-modal="true"
            aria-label="Search the menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.searchBox}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && results.length > 0) {
                    jumpTo(results[0]);
                  }
                }}
                placeholder="Search dishes…"
                aria-label="Search dishes"
                className={styles.searchInput}
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                className={styles.searchClose}
                aria-label="Close search"
              >
                ✕
              </button>
            </div>
            {query.trim().length >= 2 && (
              <ul className={styles.searchResults}>
                {results.map((item) => (
                  <li key={item.slug}>
                    <button
                      type="button"
                      onClick={() => jumpTo(item)}
                      className={styles.searchResult}
                    >
                      <span className={styles.searchResultTop}>
                        <span className={styles.searchResultName}>
                          {item.name}
                        </span>
                        <span className={styles.searchResultPrice}>
                          {item.price ?? <span className={styles.mp}>MP</span>}
                        </span>
                      </span>
                      <span className={styles.searchResultMeta}>
                        {item.sectionTitle}
                        {item.description
                          ? ` · ${item.description}`
                          : ""}
                      </span>
                    </button>
                  </li>
                ))}
                {results.length === 0 && (
                  <li className={styles.searchEmpty}>
                    No dishes match “{query.trim()}”.
                  </li>
                )}
              </ul>
            )}
            <p className={styles.searchHint}>
              {query.trim().length < 2
                ? "Type at least 2 characters."
                : `${results.length} match${
                    results.length === 1 ? "" : "es"
                  } · Enter jumps to the first.`}{" "}
              Esc closes.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
