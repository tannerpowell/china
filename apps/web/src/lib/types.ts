// Menu data types based on menu.normalized.json structure

export interface Category {
  id: string;
  title: string;
  slug: string;
  sortOrder: number;
}

export interface ModifierOption {
  id: string;
  label: string;
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  title: string;
  selectionType: 'single' | 'multi';
  min: number;
  max: number;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  sourceItemId: number;
  name: string;
  slug: string;
  categoryId: string;
  basePrice: number | null;
  description: string | null;
  likes: number;
  tags: {
    spicy: boolean;
    vegetarian: boolean;
    popular: boolean;
  };
  images: string[];
  modifierGroupIds: string[];
  order: {
    provider: string;
    cartUrl: string;
    itemOrderUrl: string | null;
  };
}

export interface MenuData {
  restaurant: {
    name: string;
    source: {
      siteUrl: string;
      scrapedAt: string;
    };
  };
  categories: Category[];
  modifierGroups: ModifierGroup[];
  items: MenuItem[];
}

// Cart types
export interface CartModifier {
  groupId: string;
  groupTitle: string;
  optionId: string;
  optionLabel: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique cart item id
  menuItem: MenuItem;
  quantity: number;
  basePrice: number;
  modifiers: CartModifier[];
  specialInstructions?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
}

// Order types for checkout
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export type OrderType = 'pickup' | 'delivery';

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  specialInstructions?: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
}
