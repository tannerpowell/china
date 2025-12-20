import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, CartItem, CartModifier, MenuItem } from './types';

const TAX_RATE = 0.0825; // 8.25% Texas sales tax

interface CartStore extends Cart {
  // Actions
  addItem: (menuItem: MenuItem, quantity: number, basePrice: number, modifiers: CartModifier[], specialInstructions?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  // Computed
  itemCount: number;
}

function generateCartItemId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function calculateTotals(items: CartItem[], taxRate: number): Pick<Cart, 'subtotal' | 'tax' | 'total'> {
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.basePrice + item.modifiers.reduce((modSum, mod) => modSum + mod.priceDelta, 0);
    return sum + (itemPrice * item.quantity);
  }, 0);

  const subtotalRounded = Math.round(subtotal * 100) / 100;
  const tax = Math.round(subtotalRounded * taxRate * 100) / 100;
  // subtotalRounded and tax are already rounded to 2 decimals, so sum is exact
  const total = subtotalRounded + tax;

  return { subtotal: subtotalRounded, tax, total };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      tax: 0,
      taxRate: TAX_RATE,
      total: 0,
      itemCount: 0,

      addItem: (menuItem, quantity, basePrice, modifiers, specialInstructions) => {
        const newItem: CartItem = {
          id: generateCartItemId(),
          menuItem,
          quantity,
          basePrice,
          modifiers,
          specialInstructions,
        };

        set((state) => {
          const newItems = [...state.items, newItem];
          const totals = calculateTotals(newItems, state.taxRate);
          return {
            ...state,
            items: newItems,
            ...totals,
            itemCount: newItems.reduce((count, item) => count + item.quantity, 0),
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId);
          const totals = calculateTotals(newItems, state.taxRate);
          return {
            ...state,
            items: newItems,
            ...totals,
            itemCount: newItems.reduce((count, item) => count + item.quantity, 0),
          };
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );
          const totals = calculateTotals(newItems, state.taxRate);
          return {
            ...state,
            items: newItems,
            ...totals,
            itemCount: newItems.reduce((count, item) => count + item.quantity, 0),
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0,
          itemCount: 0,
        });
      },
    }),
    {
      name: 'china-island-cart',
      skipHydration: true,
    }
  )
);

// Hydrate the store on the client side
if (typeof window !== 'undefined') {
  useCartStore.persist.rehydrate();
}
