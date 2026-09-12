'use client';

import { useEffect, useState } from 'react';
import { SITE_THEME_KEY } from '@/lib/site-theme';
import { ThemeToggle, type MenuTheme } from './menu3/ThemeToggle';

/**
 * Site-wide theme state (classic / warm), persisted to localStorage.
 * Drives two styling hooks at once:
 * - `document.documentElement.dataset.theme` → re-themes every page that
 *   consumes the legacy vars in globals.css (home, location, order, sidebar).
 * - the returned `theme` value → menu3 pages keep applying their
 *   `menu3-theme-*` class for the menu3 variable sets.
 * SSR and first paint always render classic; the stored theme applies on
 * mount (same behavior the menu page already had).
 */
export function useSiteTheme() {
  const [theme, setThemeState] = useState<MenuTheme>('classic');

  useEffect(() => {
    const saved = localStorage.getItem(SITE_THEME_KEY) as MenuTheme | null;
    if (saved === 'classic' || saved === 'warm' || saved === 'dark') {
      setThemeState(saved);
      document.documentElement.dataset.theme = saved;
    }
  }, []);

  function setTheme(next: MenuTheme) {
    setThemeState(next);
    try {
      localStorage.setItem(SITE_THEME_KEY, next);
    } catch {
      // Private-mode storage failure: theme still applies this session.
    }
    document.documentElement.dataset.theme = next;
  }

  return { theme, setTheme };
}

/** Drop-in theme toggle island for any page shell (sidebar, headers). */
export function SiteThemeToggle() {
  const { theme, setTheme } = useSiteTheme();
  return <ThemeToggle theme={theme} onThemeChange={setTheme} />;
}
