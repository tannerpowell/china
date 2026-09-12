'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import type { MenuItem, Category, ModifierGroup } from '@/lib/types';
import { MenuItemModal } from '@/components/menu3/MenuItemModal';
import styles from './page.module.css';

const DishOrderContext = createContext<{ openDish: (item: MenuItem) => void } | null>(
  null
);

/**
 * Makes the read-only dish list orderable. One provider per page holds the
 * open dish; each row's + button opens the shared MenuItemModal (same
 * modifiers/quantity/cart flow as the interactive menu).
 */
export function DishOrderProvider({
  categories,
  modifierGroups,
  children,
}: {
  categories: Category[];
  modifierGroups: ModifierGroup[];
  children: ReactNode;
}) {
  const [dish, setDish] = useState<MenuItem | null>(null);
  const openDish = useCallback((item: MenuItem) => setDish(item), []);

  return (
    <DishOrderContext.Provider value={{ openDish }}>
      {children}
      {dish && (
        <MenuItemModal
          item={dish}
          categories={categories}
          modifierGroups={modifierGroups}
          isOpen={true}
          onClose={() => setDish(null)}
        />
      )}
    </DishOrderContext.Provider>
  );
}

export function DishAddButton({ item }: { item: MenuItem }) {
  const ctx = useContext(DishOrderContext);
  return (
    <button
      type="button"
      className={styles.dishAdd}
      onClick={() => ctx?.openDish(item)}
      aria-label={`Add ${item.name} to order`}
      title={`Add ${item.name} to order`}
    >
      <span aria-hidden="true">+</span>
    </button>
  );
}
