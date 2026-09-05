'use client';

import React from 'react';

export type MenuTheme = 'classic' | 'warm';

interface ThemeToggleProps {
  theme: MenuTheme;
  onThemeChange: (theme: MenuTheme) => void;
}

/**
 * Theme toggle for switching between menu color schemes.
 * - Classic: White background with red/green accents (matches home page)
 * - Warm: Cream/beige background (premium feel)
 */
export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Menu theme">
      <button
        type="button"
        className={`theme-toggle-btn ${theme === 'classic' ? 'is-active' : ''}`}
        onClick={() => onThemeChange('classic')}
        role="radio"
        aria-checked={theme === 'classic'}
        title="Classic theme"
      >
        <span className="theme-preview theme-preview-classic">
          <span className="theme-dot" />
        </span>
        <span className="theme-label">Classic</span>
      </button>

      <button
        type="button"
        className={`theme-toggle-btn ${theme === 'warm' ? 'is-active' : ''}`}
        onClick={() => onThemeChange('warm')}
        role="radio"
        aria-checked={theme === 'warm'}
        title="Warm theme"
      >
        <span className="theme-preview theme-preview-warm">
          <span className="theme-dot" />
        </span>
        <span className="theme-label">Warm</span>
      </button>

    </div>
  );
}
