/**
 * Upload optimized images to Sanity and link to menu items
 */

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const apiVersion = process.env.SANITY_API_VERSION ?? "2025-01-01";
const token = process.env.SANITY_TOKEN;

if (!projectId || !token) {
  console.error("Missing SANITY_PROJECT_ID or SANITY_TOKEN in .env");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

const GALLERY_DIR = path.join(process.cwd(), "data", "gallery_final");
const MANIFEST_PATH = path.join(GALLERY_DIR, "_manifest.json");
const MAPPING_PATH = path.join(GALLERY_DIR, "_slug_mapping.json");
const DRY_RUN = process.env.DRY_RUN === "1";

// Load slug mapping (image slug -> sanity slug)
const slugMapping = JSON.parse(fs.readFileSync(MAPPING_PATH, "utf8"));

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function uploadImage(filePath, title) {
  const imageBuffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  
  const asset = await client.assets.upload("image", imageBuffer, {
    filename,
    title,
    contentType: "image/jpeg"
  });
  
  return asset._id;
}

async function getMenuItemBySlug(slug) {
  const query = `*[_type == "menuItem" && slug.current == $slug][0]{ _id, name, slug, images }`;
  return client.fetch(query, { slug });
}

async function main() {
  console.log("=== Sanity Image Upload ===");
  console.log("Project:", projectId);
  console.log("Dataset:", dataset);
  console.log("Dry run:", DRY_RUN);
  console.log("");

  // Load manifest
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  console.log("Images in manifest:", manifest.images.length);

  // Group by slug (hero + square for each dish)
  const bySlug = {};
  for (const img of manifest.images) {
    if (!bySlug[img.slug]) bySlug[img.slug] = { title: img.title, hero: null, square: null };
    if (img.cropType === "hero") bySlug[img.slug].hero = img;
    if (img.cropType === "square") bySlug[img.slug].square = img;
  }

  const slugs = Object.keys(bySlug);
  console.log("Unique dishes:", slugs.length);
  console.log("");

  const results = { uploaded: 0, linked: 0, notFound: [], errors: [] };

  for (let i = 0; i < slugs.length; i++) {
    const imageSlug = slugs[i];
    const data = bySlug[imageSlug];

    // Map image slug to Sanity slug
    const sanitySlug = slugMapping[imageSlug];
    if (sanitySlug === null) {
      console.log(`[${i + 1}/${slugs.length}] ${imageSlug} → [SKIP - no match]`);
      results.notFound.push(imageSlug);
      continue;
    }
    if (sanitySlug === undefined) {
      console.log(`[${i + 1}/${slugs.length}] ${imageSlug} → [SKIP - not in mapping]`);
      results.notFound.push(imageSlug);
      continue;
    }

    console.log(`[${i + 1}/${slugs.length}] ${imageSlug} → ${sanitySlug}`);

    // Find menu item by Sanity slug
    const menuItem = await getMenuItemBySlug(sanitySlug);
    if (!menuItem) {
      console.log("  ⚠ Menu item not found in Sanity, skipping");
      results.notFound.push(imageSlug);
      continue;
    }

    if (DRY_RUN) {
      console.log("  [DRY RUN] Would upload and link to:", menuItem.name);
      continue;
    }

    try {
      // Upload hero image
      const heroPath = path.join(GALLERY_DIR, data.hero.filename);
      console.log("  Uploading hero...");
      const heroAssetId = await uploadImage(heroPath, data.title + " (Hero)");
      results.uploaded++;

      // Upload square image
      const squarePath = path.join(GALLERY_DIR, data.square.filename);
      console.log("  Uploading square...");
      const squareAssetId = await uploadImage(squarePath, data.title + " (Square)");
      results.uploaded++;

      // Update menu item with images
      console.log("  Linking to menu item...");
      await client.patch(menuItem._id)
        .set({
          images: [
            { _type: "image", _key: "hero", asset: { _type: "reference", _ref: heroAssetId } },
            { _type: "image", _key: "square", asset: { _type: "reference", _ref: squareAssetId } }
          ]
        })
        .commit();
      
      results.linked++;
      console.log("  ✓ Done");

      // Rate limit
      await sleep(200);
    } catch (err) {
      console.log("  ✗ Error:", err.message);
      results.errors.push({ slug: imageSlug, error: err.message });
    }
  }

  console.log("\n=== Upload Complete ===");
  console.log("Images uploaded:", results.uploaded);
  console.log("Menu items linked:", results.linked);
  console.log("Not found:", results.notFound.length);
  console.log("Errors:", results.errors.length);

  if (results.notFound.length > 0) {
    console.log("\nNot found slugs:");
    results.notFound.forEach(s => console.log("  - " + s));
  }
}

main().catch(console.error);
