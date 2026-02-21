import { getAllMenuData } from "@/lib/menu-sanity";
import { Menu3PageClient } from "@/components/menu3";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Browse the full China Island Asian Grill menu. Soups, appetizers, fried rice, noodles, house favorites, chef's specials & more.",
  alternates: { canonical: "/menu" },
};

// Force dynamic rendering - menu data comes from Sanity CMS
export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const { categories, items, modifierGroups } = await getAllMenuData();

  return (
    <Menu3PageClient
      categories={categories}
      items={items}
      modifierGroups={modifierGroups}
    />
  );
}
