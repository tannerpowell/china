export function parseMoney(text: string | null | undefined): number | null {
  if (!text) return null;
  const m = text.match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/);
  if (!m) return null;
  return Number(m[1]);
}
export function parsePriceDelta(text: string): number {
  const m = text.match(/\(\s*\$\s*([0-9]+(?:\.[0-9]{1,2})?)\s*\)/);
  return m ? Number(m[1]) : 0;
}
