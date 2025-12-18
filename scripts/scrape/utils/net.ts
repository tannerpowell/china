import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { ensureDir } from "./storage.js";

export function hash(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex").slice(0, 12);
}

function guessExt(url: string): string | null {
  const m = url.split("?")[0].match(/\.([a-zA-Z0-9]{2,5})$/);
  return m ? m[1].toLowerCase() : null;
}

function contentTypeToExt(ct?: string | null): string | null {
  if (!ct) return null;
  const v = ct.toLowerCase();
  if (v.includes("jpeg")) return "jpg";
  if (v.includes("png")) return "png";
  if (v.includes("webp")) return "webp";
  if (v.includes("gif")) return "gif";
  return null;
}

export async function downloadToFile(opts: {
  fetcher: (url: string) => Promise<{ ok: boolean; body: Buffer; contentType?: string | null }>;
  url: string;
  outDir: string;
  baseName: string;
}): Promise<{ localPath: string } | null> {
  const { fetcher, url, outDir, baseName } = opts;
  const res = await fetcher(url).catch(() => null);
  if (!res?.ok) return null;
  ensureDir(outDir);
  const ext = contentTypeToExt(res.contentType) ?? guessExt(url) ?? "bin";
  const file = `${baseName}__${hash(url)}.${ext}`;
  const full = path.join(outDir, file);
  fs.writeFileSync(full, res.body);
  return { localPath: full };
}
