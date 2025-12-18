/**
 * Patch Sanity with missing prices from re-scrape
 *
 * This script:
 * 1. Updates basePrice for 44 items that were missing prices
 * 2. Creates a "Size" modifier group for items with S/L variants
 * 3. Creates a "Choose Option" modifier group for items with option variants (Lettuce Wraps)
 * 4. Links the modifier groups to the appropriate items
 */

import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import { sanity } from "../utils/sanityClient.js";

type SizeVariant = { size: string; price: number };
type OptionVariant = { option: string; price: number };
type ModifierOption = { label: string; priceDelta: number; inputType: "radio" | "checkbox" };
type ModifierGroup = { title: string; selectionType: "single" | "multi"; options: ModifierOption[] };

type PatchItem = {
  itemId: number;
  name: string;
  priceInfo: {
    basePrice: number | null;
    sizeVariants: SizeVariant[] | null;
    optionVariants: OptionVariant[] | null;
  };
  modifierGroups: ModifierGroup[];
  modalWorked: boolean;
};

function readPatchData(): PatchItem[] {
  const paths = [
    path.resolve(process.cwd(), "../../scrape/data/patches/failed_items_patch.json"),
    path.resolve(process.cwd(), "../scrape/data/patches/failed_items_patch.json"),
    path.resolve(process.cwd(), "scripts/scrape/data/patches/failed_items_patch.json"),
  ];
  const p = paths.find(p => fs.existsSync(p));
  if (!p) throw new Error("Could not find failed_items_patch.json");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  const patches = readPatchData();
  console.log(`Loaded ${patches.length} items to patch\n`);

  // Step 1: Create Size modifier group if items have size variants
  const itemsWithSizes = patches.filter(p => p.priceInfo.sizeVariants && p.priceInfo.sizeVariants.length > 0);
  const itemsWithOptions = patches.filter(p => p.priceInfo.optionVariants && p.priceInfo.optionVariants.length > 0);

  console.log("Step 1: Creating modifier groups...");

  // Create a universal Size modifier group for items that need it
  // We'll compute the deltas per-item since they vary
  // For simplicity, we'll create individual size modifier groups per unique delta pattern

  const sizeModifierIds: Map<number, string> = new Map(); // itemId -> modifierId

  for (const item of itemsWithSizes) {
    const sizes = item.priceInfo.sizeVariants!;
    const basePrice = item.priceInfo.basePrice!;

    // Create options with deltas
    const options = sizes.map(s => ({
      id: `opt_${slugify(s.size)}`,
      label: s.size,
      priceDelta: s.price - basePrice
    }));

    // Create unique modifier ID based on the delta pattern
    const deltaKey = options.map(o => `${o.label}:${o.priceDelta}`).join('|');
    const modifierId = `mod_size_${slugify(item.name.replace(/[()]/g, ''))}`;

    const modDoc = {
      _id: modifierId,
      _type: "modifierGroup",
      title: "Size",
      selectionType: "single",
      min: 0,
      max: 1,
      options
    };

    try {
      await sanity.createOrReplace(modDoc);
      console.log(`  Created modifier: ${modifierId} for ${item.name}`);
      sizeModifierIds.set(item.itemId, modifierId);
    } catch (e: any) {
      console.error(`  Error creating modifier for ${item.name}:`, e.message);
    }
  }

  // Create option modifier for Lettuce Wraps
  const optionModifierIds: Map<number, string> = new Map();

  for (const item of itemsWithOptions) {
    const opts = item.priceInfo.optionVariants!;
    const basePrice = item.priceInfo.basePrice!;

    const options = opts.map(o => ({
      id: `opt_${slugify(o.option)}`,
      label: o.option,
      priceDelta: o.price - basePrice
    }));

    const modifierId = `mod_choose_option_${slugify(item.name.replace(/[()]/g, ''))}`;

    const modDoc = {
      _id: modifierId,
      _type: "modifierGroup",
      title: "Choose Option",
      selectionType: "single",
      min: 0,
      max: 1,
      options
    };

    try {
      await sanity.createOrReplace(modDoc);
      console.log(`  Created modifier: ${modifierId} for ${item.name}`);
      optionModifierIds.set(item.itemId, modifierId);
    } catch (e: any) {
      console.error(`  Error creating modifier for ${item.name}:`, e.message);
    }
  }

  console.log(`\nStep 2: Patching ${patches.length} menu items with prices...\n`);

  let updated = 0;
  let errors = 0;

  for (const item of patches) {
    const docId = `item_${item.itemId}`;

    if (item.priceInfo.basePrice === null) {
      console.log(`  Skipping ${item.name} - no price`);
      continue;
    }

    try {
      // Build the patch
      const patchOps: any = {
        basePrice: item.priceInfo.basePrice
      };

      // Get current modifier groups for this item
      const existing = await sanity.fetch(`*[_id == $id][0]{modifierGroups}`, { id: docId });
      let modifierRefs = existing?.modifierGroups || [];

      // Add size modifier if applicable
      const sizeModId = sizeModifierIds.get(item.itemId);
      if (sizeModId) {
        const alreadyHas = modifierRefs.some((r: any) => r._ref === sizeModId);
        if (!alreadyHas) {
          modifierRefs = [...modifierRefs, { _type: "reference", _ref: sizeModId, _key: `ref_${sizeModId}` }];
        }
      }

      // Add option modifier if applicable
      const optModId = optionModifierIds.get(item.itemId);
      if (optModId) {
        const alreadyHas = modifierRefs.some((r: any) => r._ref === optModId);
        if (!alreadyHas) {
          modifierRefs = [...modifierRefs, { _type: "reference", _ref: optModId, _key: `ref_${optModId}` }];
        }
      }

      if (modifierRefs.length > 0) {
        patchOps.modifierGroups = modifierRefs;
      }

      await sanity.patch(docId).set(patchOps).commit();

      const modInfo = (sizeModId || optModId) ? ` + modifiers` : '';
      console.log(`  ✓ ${item.name}: $${item.priceInfo.basePrice}${modInfo}`);
      updated++;
    } catch (e: any) {
      console.error(`  ✗ ${item.name}: ${e.message}`);
      errors++;
    }
  }

  console.log(`\n=== COMPLETE ===`);
  console.log(`Updated: ${updated} items`);
  console.log(`Errors: ${errors} items`);
  console.log(`Size modifiers created: ${sizeModifierIds.size}`);
  console.log(`Option modifiers created: ${optionModifierIds.size}`);
}

main().catch(e => { console.error(e); process.exit(1); });
