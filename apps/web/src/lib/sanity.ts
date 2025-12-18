import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'o2zvhwfq';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01';

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Use CDN for faster reads in production
});

// GROQ Queries
export const queries = {
  categories: `*[_type == "menuCategory"] | order(sortOrder asc) {
    _id,
    title,
    "slug": slug.current,
    sortOrder,
    "heroImage": heroImage.asset->url
  }`,

  menuItems: `*[_type == "menuItem"] {
    _id,
    sourceItemId,
    name,
    "slug": slug.current,
    basePrice,
    description,
    likes,
    tags,
    "categoryId": category._ref,
    "modifierGroupIds": modifierGroups[]._ref,
    "images": images[].asset->url,
    order
  }`,

  modifierGroups: `*[_type == "modifierGroup"] {
    _id,
    title,
    selectionType,
    min,
    max,
    options
  }`,

  itemsByCategory: (categoryId: string) => `*[_type == "menuItem" && category._ref == "${categoryId}"] | order(likes desc) {
    _id,
    sourceItemId,
    name,
    "slug": slug.current,
    basePrice,
    description,
    likes,
    tags,
    "categoryId": category._ref,
    "modifierGroupIds": modifierGroups[]._ref,
    "images": images[].asset->url,
    order
  }`,

  restaurantSettings: `*[_type == "restaurantSettings"][0] {
    name,
    phone,
    address,
    hours,
    primaryOrderUrl
  }`,
};

// Types for Sanity data
export interface SanityCategory {
  _id: string;
  title: string;
  slug: string;
  sortOrder: number;
  heroImage?: string;
}

export interface SanityMenuItem {
  _id: string;
  sourceItemId: number;
  name: string;
  slug: string;
  basePrice: number | null;
  description: string | null;
  likes: number;
  tags: {
    spicy: boolean;
    vegetarian: boolean;
    popular: boolean;
  };
  categoryId: string;
  modifierGroupIds: string[];
  images: string[];
  order: {
    provider: string;
    cartUrl: string;
    itemOrderUrl: string | null;
  };
}

export interface SanityModifierGroup {
  _id: string;
  title: string;
  selectionType: 'single' | 'multi';
  min: number;
  max: number;
  options: {
    id: string;
    label: string;
    priceDelta: number;
  }[];
}

// Fetch functions
export async function fetchCategories(): Promise<SanityCategory[]> {
  return sanityClient.fetch(queries.categories);
}

export async function fetchMenuItems(): Promise<SanityMenuItem[]> {
  return sanityClient.fetch(queries.menuItems);
}

export async function fetchModifierGroups(): Promise<SanityModifierGroup[]> {
  return sanityClient.fetch(queries.modifierGroups);
}

export async function fetchItemsByCategory(categoryId: string): Promise<SanityMenuItem[]> {
  return sanityClient.fetch(queries.itemsByCategory(categoryId));
}
