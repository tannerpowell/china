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

      <style jsx>{`
        .theme-toggle {
          display: flex;
          gap: 6px;
          padding: 4px;
          background: rgba(0, 0, 0, 0.04);
          border-radius: 10px;
        }

        .theme-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: transparent;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .theme-toggle-btn:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        .theme-toggle-btn.is-active {
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .theme-preview {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid transparent;
        }

        .theme-preview-classic {
          background: #ffffff;
          border-color: #e0e0e0;
        }

        .theme-preview-classic .theme-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f74140;
        }

        .theme-preview-warm {
          background: #FDF8ED;
          border-color: #e8e0d4;
        }

        .theme-preview-warm .theme-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #B8423C;
        }

        .theme-label {
          font-family: 'Sen', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: var(--menu3-text-muted, #666);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .theme-toggle-btn.is-active .theme-label {
          color: var(--menu3-text, #333);
        }

        @media (max-width: 768px) {
          .theme-label {
            display: none;
          }

          .theme-toggle-btn {
            padding: 6px 8px;
          }
        }
      `}</style>
    </div>
  );
}
