import { cache } from 'react';
import { sanityClient, queries, SanityCategory, SanityMenuItem, SanityModifierGroup } from './sanity';
import * as localMenu from './menu';
import type { Category, MenuItem, ModifierGroup } from './types';

// Check if Sanity is configured (project ID present; dataset defaults to
// production, matching sanity.config.ts)
function isSanityConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
}

// Transform Sanity data to match existing types
function transformCategory(cat: SanityCategory): Category {
  return {
    id: cat._id,
    title: cat.title,
    slug: cat.slug,
    sortOrder: cat.sortOrder,
  };
}

function transformMenuItem(item: SanityMenuItem): MenuItem {
  return {
    id: item._id,
    sourceItemId: item.sourceItemId,
    name: item.name,
    slug: item.slug,
    categoryId: item.categoryId,
    basePrice: item.basePrice,
    description: item.description,
    likes: item.likes || 0,
    tags: item.tags || { spicy: false, vegetarian: false, popular: false },
    images: item.images || [],
    modifierGroupIds: item.modifierGroupIds || [],
    order: item.order || { provider: '', cartUrl: '', itemOrderUrl: null },
  };
}

function transformModifierGroup(group: SanityModifierGroup): ModifierGroup {
  return {
    id: group._id,
    title: group.title,
    // Studio validation requires these on new docs, but imported/legacy
    // docs may omit them — normalize defensively so readers never see
    // undefined selection limits or NaN prices.
    selectionType: group.selectionType ?? 'single',
    min: group.min ?? 0,
    max: group.max ?? 1,
    options: (group.options || []).map(opt => ({
      // Identity precedence: imported id, then Sanity's stable array _key,
      // then the label as a legacy last resort (labels can collide/rename).
      id: opt.id || opt._key || opt.label,
      label: opt.label,
      priceDelta: opt.priceDelta ?? 0,
    })),
  };
}

// Use React cache() for request-scoped memoization (prevents stale data in serverless)
// Falls back to local JSON when Sanity is not configured or unavailable
//
// Atomicity rule: the menu is one consistency unit. Either the ENTIRE
// Sanity dataset validates (non-empty, references resolve) or the ENTIRE
// local dataset is used. Collections never mix sources — a partial Sanity
// failure must not combine Sanity items with local categories.
interface MenuDataset {
  categories: Category[];
  items: MenuItem[];
  modifierGroups: ModifierGroup[];
}

function isValidDataset(
  cats: SanityCategory[], items: SanityMenuItem[], mods: SanityModifierGroup[]
): boolean {
  // Empty or unpopulated dataset (fresh project, wrong dataset, interrupted
  // import) is not an error from fetch() — reject it explicitly.
  if (cats.length === 0 || items.length === 0) return false;
  const catIds = new Set(cats.map((c) => c._id));
  const modIds = new Set(mods.map((m) => m._id));
  return items.every(
    (i) =>
      !!i._id &&
      !!i.name &&
      !!i.categoryId &&
      catIds.has(i.categoryId) &&
      (i.modifierGroupIds || []).every((id) => modIds.has(id))
  );
}

const loadMenuDataset = cache(async (): Promise<MenuDataset> => {
  if (isSanityConfigured()) {
    try {
      const [cats, items, mods] = await Promise.all([
        sanityClient.fetch<SanityCategory[]>(queries.categories),
        sanityClient.fetch<SanityMenuItem[]>(queries.menuItems),
        sanityClient.fetch<SanityModifierGroup[]>(queries.modifierGroups),
      ]);
      if (isValidDataset(cats, items, mods)) {
        return {
          categories: cats.map(transformCategory),
          items: items.map(transformMenuItem),
          modifierGroups: mods.map(transformModifierGroup),
        };
      }
      console.error('Sanity dataset failed validation, falling back to local data');
    } catch (error) {
      console.error('Sanity fetch failed, falling back to local data:', error);
    }
  }
  return {
    categories: localMenu.getCategories(),
    items: localMenu.getItems(),
    modifierGroups: localMenu.getModifierGroups(),
  };
});

export const getCategories = cache(async (): Promise<Category[]> => {
  return (await loadMenuDataset()).categories;
});

export const getMenuItems = cache(async (): Promise<MenuItem[]> => {
  return (await loadMenuDataset()).items;
});

export const getModifierGroups = cache(async (): Promise<ModifierGroup[]> => {
  return (await loadMenuDataset()).modifierGroups;
});

export async function getItemsByCategory(categoryId: string): Promise<MenuItem[]> {
  return (await loadMenuDataset()).items.filter((i) => i.categoryId === categoryId);
}

export async function getModifierGroup(id: string): Promise<ModifierGroup | undefined> {
  return (await loadMenuDataset()).modifierGroups.find((g) => g.id === id);
}

export async function getItem(id: string): Promise<MenuItem | undefined> {
  return (await loadMenuDataset()).items.find((i) => i.id === id);
}

// Get all menu data in one call (for SSR)
export async function getAllMenuData() {
  const [categories, items, modifierGroups] = await Promise.all([
    getCategories(),
    getMenuItems(),
    getModifierGroups(),
  ]);

  return { categories, items, modifierGroups };
}
