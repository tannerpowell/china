import { log } from "./utils/logger.js";
import { readJson, writeJson } from "./utils/storage.js";

const MENU_URL = process.env.MENU_URL ?? "http://www.chinaislandasiangrill.com/menu.asp";

function cleanDescription(rawHtml: string): string | null {
  // Adjacent inline spans split words mid-word ("c</span><span>an") —
  // join those boundaries with nothing before turning tags into spaces.
  let t = rawHtml
    .replace(/<\/span><span[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  t = t
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
  // Platform artifacts: stray "?" separators in the source copy
  t = t.replace(/\?/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  // Strip decorative **bold** markers used in the source copy
  t = t.replace(/^\*+\s*/, "").replace(/\s*\*+$/, "").trim();
  t = t.replace(/\*\*/g, " ").replace(/\s+/g, " ").trim();
  // Fix an obvious typo repeated across many items ("cannot be make" -> "cannot be made")
  t = t.replace(/cannot be make\b/gi, "cannot be made");
  return t === "" ? null : t;
}

async function main() {
  log("Fetching menu:", MENU_URL);
  const res = await fetch(MENU_URL);
  if (!res.ok) throw new Error(`menu.asp returned ${res.status}`);
  const html = await res.text();

  const descriptions = new Map<number, string>();

  // The source markup nests <p> inside <p id="name_info"> and splits words
  // across <span>s, which makes DOM parsers restructure the tree and lose
  // text. Extract per-item blocks with a tag-depth scan over the raw HTML.
  const anchorRe = /addtocart\((\d+)\)">/g;
  let m: RegExpExecArray | null;
  while ((m = anchorRe.exec(html)) !== null) {
    const itemId = Number(m[1]);
    if (descriptions.has(itemId)) continue;
    const afterAnchor = html.slice(m.index + m[0].length);
    const nameEnd = afterAnchor.indexOf("</a>");
    if (nameEnd === -1) continue;
    const afterName = afterAnchor.slice(nameEnd + "</a>".length);
    const infoOpen = '<p id="name_info">';
    if (!afterName.startsWith(infoOpen)) continue;
    // Scan with <p> depth counting to find the matching close tag
    const body = afterName.slice(infoOpen.length);
    let depth = 1; // the <p id="name_info"> itself
    const tagRe = /<\/?p[\s>]/gi;
    let tm: RegExpExecArray | null;
    let inner = "";
    while ((tm = tagRe.exec(body)) !== null) {
      if (tm[0].startsWith("</")) {
        depth--;
        if (depth === 0) {
          inner = body.slice(0, tm.index);
          break;
        }
      } else {
        depth++;
      }
    }
    const cleaned = cleanDescription(inner);
    if (cleaned) descriptions.set(itemId, cleaned);
  }

  log(`Found descriptions for ${descriptions.size} items`);
  if (descriptions.size === 0) {
    throw new Error("No descriptions parsed — source markup may have changed; refusing to wipe existing copy");
  }

  const rawPath = "data/raw/menu_capture.full.json";
  const raw = readJson<{ items: any[] }>(rawPath);
  if (raw.items.length === 0) throw new Error("Raw capture has no items — refusing to write");

  // Deterministic rebuild: every item's description is set from the current
  // source response or cleared. Stale copy from a previous run never survives.
  let patched = 0;
  let cleared = 0;
  for (const it of raw.items) {
    const d = descriptions.get(Number(it.itemId)) ?? null;
    it.modal = it.modal ?? {};
    if (it.modal.description && !d) cleared++;
    if (d) patched++;
    it.modal.description = d;
  }

  writeJson(rawPath, raw);
  log(`Patched ${patched}, cleared ${cleared} of ${raw.items.length} items in ${rawPath}`);

  // Show a few samples
  const samples = raw.items.filter((it: any) => it.modal?.description).slice(0, 5);
  for (const s of samples) log(`- ${s.itemId} ${s.modal.modalItemName}: ${(s.modal.description as string).slice(0, 80)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
