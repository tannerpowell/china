'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { MenuItem, Category, ModifierGroup } from '@/lib/types';
import { useCartStore } from '@/lib/cart-store';
import { CategoryNav } from './CategoryNav';
import { MenuList } from './MenuList';
import { PeekPreview } from './PeekPreview';
import { MenuItemModal } from './MenuItemModal';
import { ThemeToggle, type MenuTheme } from './ThemeToggle';

const THEME_STORAGE_KEY = 'china-island-menu-theme';

interface Menu3PageClientProps {
  categories: Category[];
  items: MenuItem[];
  modifierGroups: ModifierGroup[];
}

/**
 * Premium 3-pane menu layout for China Island.
 *
 * Desktop (>= 1024px):
 * - Left pane (sticky): Category navigation + search
 * - Center pane: Dense item list with typography-driven rows
 * - Right pane: Contextual hover preview
 *
 * Mobile:
 * - Collapsed to single column
 * - Horizontal category chips
 * - Tap to open modal (no peek)
 */
export default function Menu3PageClient({
  categories,
  items,
  modifierGroups,
}: Menu3PageClientProps) {
  const itemCount = useCartStore((state) => state.itemCount);

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState<MenuTheme>('classic');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as MenuTheme | null;
    if (savedTheme && (savedTheme === 'classic' || savedTheme === 'warm')) {
      setTheme(savedTheme);
    }
  }, []);

  // Handle theme change
  function handleThemeChange(newTheme: MenuTheme) {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }

  // Category state
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Peek preview state
  const [peekItem, setPeekItem] = useState<MenuItem | null>(null);

  // Modal state
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);

  // Use default theme class on server, actual theme after hydration
  const themeClass = mounted ? `menu3-theme-${theme}` : 'menu3-theme-classic';

  return (
    <div className={`menu3-page ${themeClass}`}>
      {/* Header */}
      <header className="menu3-header">
        <Link
          href="/"
          className="menu3-brand"
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="China Island Asian Grill"
            className="menu3-logo"
            style={{ width: '64px', height: '64px', flexShrink: 0 }}
          />
          <div className="menu3-brand-text">
            <span className="menu3-brand-name">China Island</span>
            <span className="menu3-brand-tagline">Asian Grill</span>
          </div>
        </Link>

        <div className="menu3-header-actions">
          <ThemeToggle theme={theme} onThemeChange={handleThemeChange} />

          {itemCount > 0 && (
            <Link href="/checkout" className="menu3-cart-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="menu3-cart-count">{itemCount}</span>
              View Cart
            </Link>
          )}
        </div>
      </header>

      {/* Main 3-Pane Layout */}
      <div className="menu3-layout">
        {/* Left Pane - Category Navigation */}
        <aside className="menu3-sidebar">
          <CategoryNav
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </aside>

        {/* Center Pane - Menu List */}
        <main className="menu3-main">
          <MenuList
            items={items}
            categories={categories}
            selectedCategory={selectedCategory}
            searchTerm={searchTerm}
            onItemHover={setPeekItem}
            onItemClick={setModalItem}
          />
        </main>

        {/* Right Pane - Peek Preview (Desktop only) */}
        <aside className="menu3-preview">
          <div className="menu3-preview-sticky">
            <PeekPreview item={peekItem} />
          </div>
        </aside>
      </div>

      {/* Item Modal */}
      {modalItem && (
        <MenuItemModal
          item={modalItem}
          categories={categories}
          modifierGroups={modifierGroups}
          isOpen={true}
          onClose={() => setModalItem(null)}
        />
      )}

      <style jsx>{`
        .menu3-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--menu3-main-bg, #FDF8ED);
        }

        /* Subtle warm texture */
        .menu3-page::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.015'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        /* Header */
        .menu3-header {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          min-height: 88px;
          background: var(--menu3-main-bg, #FDF8ED);
          border-bottom: var(--menu3-border-dashed, 2px dashed #f74140);
        }

        .menu3-brand {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 16px;
          text-decoration: none;
        }

        .menu3-logo {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .menu3-brand-text {
          display: flex;
          flex-direction: column;
        }

        .menu3-brand-name {
          font-family: 'Sen', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: var(--menu3-accent, #f74140);
          line-height: 1.1;
        }

        .menu3-brand-tagline {
          font-family: 'Sen', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: var(--menu3-text-muted, #8A8583);
          letter-spacing: 0.02em;
        }

        .menu3-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .menu3-cart-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: var(--menu3-accent, #B8423C);
          color: white;
          border-radius: 10px;
          font-family: 'Sen', sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }

        .menu3-cart-button:hover {
          background: var(--menu3-accent-light, #D4635E);
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
        }

        .menu3-cart-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: white;
          color: var(--menu3-accent, #B8423C);
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
        }

        /* 3-Pane Layout */
        .menu3-layout {
          position: relative;
          display: grid;
          grid-template-columns: 220px 1fr 380px;
          flex: 1;
          z-index: 1;
          padding: 0 20px;
        }

        /* Sidebar */
        .menu3-sidebar {
          position: sticky;
          top: 88px;
          height: calc(100vh - 88px);
          background: var(--menu3-sidebar-bg, rgba(42, 37, 34, 0.03));
          border-right: var(--menu3-border-dashed, 2px dashed #f74140);
          overflow: hidden;
          box-sizing: border-box;
          margin-right: -1px;
        }

        /* Main content */
        .menu3-main {
          padding: 24px 32px;
          min-width: 0;
        }

        /* Preview pane */
        .menu3-preview {
          background: var(--menu3-preview-bg, rgba(42, 37, 34, 0.02));
          border-left: 1px solid var(--menu3-border, rgba(0, 0, 0, 0.06));
          padding: 28px;
        }

        .menu3-preview-sticky {
          position: sticky;
          top: 116px;
        }

        /* Tablet: Hide preview */
        @media (max-width: 1280px) {
          .menu3-layout {
            grid-template-columns: 200px 1fr;
            padding: 0 16px;
          }

          .menu3-preview {
            display: none;
          }
        }

        /* Mobile: Single column */
        @media (max-width: 1023px) {
          .menu3-layout {
            grid-template-columns: 1fr;
            padding: 0;
          }

          .menu3-header {
            padding: 10px 16px;
            min-height: 72px;
          }

          .menu3-brand {
            gap: 10px;
          }

          .menu3-logo {
            width: 44px;
            height: 44px;
          }

          .menu3-brand-name {
            font-size: 20px;
          }

          .menu3-brand-tagline {
            font-size: 11px;
          }

          .menu3-cart-button {
            padding: 8px 12px;
            font-size: 12px;
          }

          .menu3-sidebar {
            position: sticky;
            top: 72px;
            height: auto;
            border-right: none;
            border-bottom: var(--menu3-border-dashed, 2px dashed #f74140);
            overflow-x: auto;
            z-index: 50;
          }

          .menu3-main {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
