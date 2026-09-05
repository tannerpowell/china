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

    </div>
  );
}
