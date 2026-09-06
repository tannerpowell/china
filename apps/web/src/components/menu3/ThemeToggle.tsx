'use client';

import React from 'react';

export type MenuTheme = 'classic' | 'warm' | 'dark';

interface ThemeToggleProps {
  theme: MenuTheme;
  onThemeChange: (theme: MenuTheme) => void;
}

const OPTIONS: { id: MenuTheme; label: string }[] = [
  { id: 'classic', label: 'Classic theme' },
  { id: 'warm', label: 'Warm theme' },
  { id: 'dark', label: 'Dark theme' },
];

/**
 * Dense theme switcher: three swatch circles (green / beige / charcoal).
 * Radiogroup semantics with tooltip + screen-reader labels; the active
 * theme gets a ring. No visible text — captions live with the consumer
 * (e.g. "Preview theme" in the sidebar).
 */
export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Site theme">
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
          title={opt.label}
          aria-label={opt.label}
        />
      ))}
    </div>
  );
}
