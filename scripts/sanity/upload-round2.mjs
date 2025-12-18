
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const apiVersion = process.env.SANITY_API_VERSION ?? "2025-01-01";
const token = process.env.SANITY_TOKEN;

if (!projectId || !token) {
  console.error("Missing SANITY_PROJECT_ID or SANITY_TOKEN");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
const GALLERY_DIR = "/Users/tp/Projects/China Island Grill/china-island-redesign/data/gallery_final";
const DRY_RUN = process.env.DRY_RUN === "1";

// New dishes to upload (round 2)
const newDishes = [
  "bbq-pork-fried-rice",
  "broccoli-stir-fry",
  "chicken-dumplings-6",
  "crispy-tilapia-w-special-house-sauce",
  "chow-fun-flat-rice-noodles-combination",
  "lo-mein-noodles-combination",
  "phad-thai-noodles-combination",
  "singapore-rice-noodles-combination",
  "udon-noodles",
  "udon-noodles-combination",
  "shrimp-w-lobster-sauce",
  "sweet-and-sour",
  "teriyaki-chicken-satay-3",
  "tofu-fried-rice",
  "vanilla-shrimp",
  "vegetable-and-tofu-soup",
  "vegetable-fried-rice",
  "vegetable-spring-roll-2"
];

// Large (L) versions that should copy from regular version
const largeCopies = {
  "almond-stir-fry-l": "almond-stir-fry",
  "black-bean-stir-fry-l": "black-bean-stir-fry",  // maps to black-bean-sauce-stir-fry images
  "broccoli-stir-fry-l": "broccoli-stir-fry",
  "cashew-stir-fry-l": "cashew-stir-fry",
  "general-tsao-s-chicken-l": "general-tsos-chicken",
  "hot-garlic-stir-fry-l": "hot-garlic-stir-fry",
  "hunan-stir-fry-l": "hunan-chicken-lunch",
  "jalapeno-stir-fry-l": "jalapeno-stir-fry",
  "kung-pao-stir-fry-l": "kung-pao-chicken",
  "lo-mein-noodles-l": "beef-lo-mein",
  "mongolian-stir-fry-l": "mongolian-beef",
  "orange-chicken-l": "orange-chicken",
  "sesame-honey-seared-chicken-l": "sesame-chicken",
  "sichuan-stir-fry-l": "sichuan-stir-fry",
  "sweet-and-sour-l": "sweet-and-sour",
  "fried-rice-l": "house-special-fried-rice"
};

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function uploadImage(filePath, title) {
  const imageBuffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  const asset = await client.assets.upload("image", imageBuffer, { filename, title, contentType: "image/jpeg" });
  return asset._id;
}

async function getMenuItemBySlug(slug) {
  const query = `*[_type == "menuItem" && slug.current == $slug][0]{ _id, name, images }`;
  return client.fetch(query, { slug });
}

async function main() {
  console.log("=== Round 2 Image Upload ===");
  console.log("Dry run:", DRY_RUN);
  
  const results = { uploaded: 0, linked: 0, errors: [] };

  // 1. Upload new dishes
  console.log("\n--- Uploading " + newDishes.length + " new dishes ---");
  for (const slug of newDishes) {
    const heroFile = slug + "__hero_4x3.jpg";
    const squareFile = slug + "__square_1x1.jpg";
    const heroPath = path.join(GALLERY_DIR, heroFile);
    const squarePath = path.join(GALLERY_DIR, squareFile);

    if (!fs.existsSync(heroPath)) {
      console.log(slug + ": hero file not found, skipping");
      continue;
    }

    const menuItem = await getMenuItemBySlug(slug);
    if (!menuItem) {
      console.log(slug + ": menu item not found");
      continue;
    }

    console.log(slug + " -> " + menuItem.name);
    
    if (DRY_RUN) continue;

    try {
      const heroAssetId = await uploadImage(heroPath, menuItem.name + " (Hero)");
      results.uploaded++;
      const squareAssetId = await uploadImage(squarePath, menuItem.name + " (Square)");
      results.uploaded++;

      await client.patch(menuItem._id).set({
        images: [
          { _type: "image", _key: "hero", asset: { _type: "reference", _ref: heroAssetId } },
          { _type: "image", _key: "square", asset: { _type: "reference", _ref: squareAssetId } }
        ]
      }).commit();
      results.linked++;
      console.log("  ✓ Done");
      await sleep(200);
    } catch (err) {
      console.log("  ✗ " + err.message);
      results.errors.push({ slug, error: err.message });
    }
  }

  // 2. Copy images to (L) versions
  console.log("\n--- Copying to " + Object.keys(largeCopies).length + " large (L) versions ---");
  for (const [targetSlug, sourceSlug] of Object.entries(largeCopies)) {
    const heroFile = sourceSlug + "__hero_4x3.jpg";
    const squareFile = sourceSlug + "__square_1x1.jpg";
    const heroPath = path.join(GALLERY_DIR, heroFile);
    const squarePath = path.join(GALLERY_DIR, squareFile);

    if (!fs.existsSync(heroPath)) {
      console.log(targetSlug + ": source " + sourceSlug + " not found");
      continue;
    }

    const menuItem = await getMenuItemBySlug(targetSlug);
    if (!menuItem) {
      console.log(targetSlug + ": menu item not found");
      continue;
    }

    console.log(targetSlug + " <- " + sourceSlug);

    if (DRY_RUN) continue;

    try {
      const heroAssetId = await uploadImage(heroPath, menuItem.name + " (Hero)");
      results.uploaded++;
      const squareAssetId = await uploadImage(squarePath, menuItem.name + " (Square)");
      results.uploaded++;

      await client.patch(menuItem._id).set({
        images: [
          { _type: "image", _key: "hero", asset: { _type: "reference", _ref: heroAssetId } },
          { _type: "image", _key: "square", asset: { _type: "reference", _ref: squareAssetId } }
        ]
      }).commit();
      results.linked++;
      console.log("  ✓ Done");
      await sleep(200);
    } catch (err) {
      console.log("  ✗ " + err.message);
      results.errors.push({ slug: targetSlug, error: err.message });
    }
  }

  console.log("\n=== Complete ===");
  console.log("Uploaded:", results.uploaded);
  console.log("Linked:", results.linked);
  console.log("Errors:", results.errors.length);
}

main().catch(console.error);
