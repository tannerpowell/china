'use client';

import { useEffect, useState } from "react";
import styles from "./page.module.css";

interface NavSection {
  slug: string;
  title: string;
  count: number;
}

/**
 * Sticky anchor nav with scroll-spy. Plain hash links do the navigating
 * (works with no JS); the observer only paints the active state.
 */
export function SectionNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState<string>("");

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

  return (
    <nav className={styles.nav} aria-label="Menu sections">
      <div className={styles.navInner}>
        <a href="#top" className={styles.navBrand}>
          Full Menu
        </a>
        <div className={styles.navLinks}>
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
      </div>
    </nav>
  );
}
