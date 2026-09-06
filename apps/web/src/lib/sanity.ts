import { createClient, type SanityClient } from '@sanity/client';

// Lazy-initialized Sanity client to avoid build-time errors
let _client: SanityClient | null = null;

function getSanityConfig() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  // Same default as sanity.config.ts: the setup docs name this dataset.
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

  if (!projectId) {
    throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable');
  }

  return {
    projectId,
    dataset,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-01',
    // CDN is faster but may have slight delay for fresh content
    useCdn: process.env.NEXT_PUBLIC_SANITY_USE_CDN === 'true',
  };
}

function getSanityClient(): SanityClient {
  if (!_client) {
    _client = createClient(getSanityConfig());
  }
  return _client;
}

// Export a proxy that lazily initializes the client
export const sanityClient = {
  fetch<T>(query: string, params?: Record<string, unknown>): Promise<T> {
    const client = getSanityClient();
    // Use separate calls to satisfy Sanity's strict overload signatures
    if (params) {
      return client.fetch<T>(query, params);
    }
    return client.fetch<T>(query);
  },
};

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

  itemsByCategory: `*[_type == "menuItem" && category._ref == $categoryId] | order(likes desc) {
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

  menuItemById: `*[_type == "menuItem" && _id == $id][0] {
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

  modifierGroupById: `*[_type == "modifierGroup" && _id == $id][0] {
    _id,
    title,
    selectionType,
    min,
    max,
    options
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
  selectionType?: 'single' | 'multi';
  min?: number;
  max?: number;
  options: {
    _key?: string;
    id?: string;
    label: string;
    priceDelta?: number;
  }[];
}

