/**
 * Optimize menu images for web and prepare for Sanity upload
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const INPUT_DIRS = [
  path.join(process.cwd(), "data", "gallery_upscale"),
  path.join(process.cwd(), "data", "gallery_generated")
];
const OUTPUT_DIR = path.join(process.cwd(), "data", "gallery_final");
const QUALITY = 85;

const TITLE_OVERRIDES = {
  "bbq": "BBQ",
  "lo": "Lo",
  "mein": "Mein",
  "gai": "Gai",
  "pan": "Pan",
  "moo": "Moo",
  "goo": "Goo",
  "foo": "Foo",
  "kung": "Kung",
  "pao": "Pao",
  "tsos": "Tso's",
  "mapo": "Ma Po",
  "sichuan": "Sichuan",
  "udon": "Udon",
  "thai": "Thai",
  "satay": "Satay",
  "teriyaki": "Teriyaki",
  "bok": "Bok",
  "choy": "Choy",
  "veg": "Vegetable",
};

const LOWERCASE_WORDS = ["with", "and", "in", "of", "the", "a"];

function slugToTitle(slug) {
  const baseName = slug.replace(/__(hero_4x3|square_1x1)$/, "");
  const words = baseName.split(/-(?![0-9])/).filter(w => w);
  return words.map((word, idx) => {
    const lower = word.toLowerCase();
    if (TITLE_OVERRIDES[lower]) return TITLE_OVERRIDES[lower];
    if (/^\d+$/.test(word)) return "(" + word + ")";
    if (idx > 0 && LOWERCASE_WORDS.includes(lower)) return lower;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(" ");
}

function getCropType(filename) {
  if (filename.includes("hero_4x3")) return "hero";
  if (filename.includes("square_1x1")) return "square";
  return "unknown";
}

function getSlug(filename) {
  return filename.replace(/__(hero_4x3|square_1x1)\.(png|jpg)$/, "");
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log("Using sips (macOS built-in) for conversion");

  const manifest = { generatedAt: new Date().toISOString(), quality: QUALITY, images: [] };
  let processed = 0, skipped = 0;

  for (const inputDir of INPUT_DIRS) {
    if (!fs.existsSync(inputDir)) continue;
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith(".png"));
    console.log("\nProcessing " + files.length + " images from " + path.basename(inputDir) + "...");

    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const outputFile = file.replace(".png", ".jpg");
      const outputPath = path.join(OUTPUT_DIR, outputFile);

      if (fs.existsSync(outputPath)) { skipped++; continue; }

      const slug = getSlug(file);
      const cropType = getCropType(file);
      const title = slugToTitle(slug);

      try {
        execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", String(QUALITY), inputPath, "--out", outputPath], { stdio: "pipe" });
        const stats = fs.statSync(outputPath);
        manifest.images.push({ filename: outputFile, slug, title, cropType, sizeKB: Math.round(stats.size / 1024), source: path.basename(inputDir) });
        processed++;
        if (processed % 20 === 0) console.log("  Processed " + processed + " images...");
      } catch (err) {
        console.error("  Failed: " + file);
      }
    }
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, "_manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("\n=== Complete ===");
  console.log("Processed: " + processed + ", Skipped: " + skipped);
  console.log("\nSample titles:");
  manifest.images.filter(i => i.cropType === "hero").slice(0,10).forEach(i => console.log("  " + i.slug + " -> \"" + i.title + "\""));
  const totalMB = (manifest.images.reduce((s,i) => s + i.sizeKB, 0) / 1024).toFixed(1);
  console.log("\nTotal size: " + totalMB + " MB");
}

main();
