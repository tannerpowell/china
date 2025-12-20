import fs from "node:fs";
import path from "node:path";
export function ensureDir(p: string) { fs.mkdirSync(p, { recursive: true }); }
export function writeJson(filePath: string, data: any) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
export function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}
