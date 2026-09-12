'use client';

import React from 'react';
import { st } from '@/lib/i18n';
import { useSiteLang } from '@/components/LanguageToggle';

export type MenuTheme = 'classic' | 'warm' | 'dark';

interface ThemeToggleProps {
  theme: MenuTheme;
  onThemeChange: (theme: MenuTheme) => void;
}

const OPTIONS: { id: MenuTheme; labelKey: string }[] = [
  { id: 'classic', labelKey: 'theme.classic' },
  { id: 'warm', labelKey: 'theme.warm' },
  { id: 'dark', labelKey: 'theme.dark' },
];

/**
 * Dense theme switcher: three swatch circles (green / beige / charcoal).
 * Radiogroup semantics with tooltip + screen-reader labels; the active
 * theme gets a ring. No visible text — captions live with the consumer
 * (e.g. "Preview theme" in the sidebar).
 */
export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  const { lang } = useSiteLang();
  return (
    <div className="theme-toggle" role="radiogroup" aria-label={st('theme.group', lang)}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`theme-toggle-btn theme-swatch-${opt.id} ${
            theme === opt.id ? 'is-active' : ''
          }`}
          onClick={() => onThemeChange(opt.id)}
          role="radio"
          aria-checked={theme === opt.id}
          title={st(opt.labelKey, lang)}
          aria-label={st(opt.labelKey, lang)}
        />
      ))}
    </div>
  );
}
