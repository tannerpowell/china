import { st, tf } from "@/lib/i18n";

/**
 * Bilingual UI chrome. Renders EN + ZH spans; CSS shows one based on
 * `document.documentElement.dataset.lang` (default EN, no flash thanks to
 * the beforeInteractive script in layout.tsx).
 *
 * DISH DATA NEVER GOES HERE — names, descriptions, categories, modifiers,
 * and prices always render English (see lib/i18n.ts docs).
 */
export function T({
  id,
  vars,
  className,
}: {
  id: string;
  vars?: Record<string, string | number>;
  className?: string;
}) {
  const cls = className ? ` ${className}` : "";
  const en = vars ? tf(id, "en", vars) : st(id, "en");
  const zh = vars ? tf(id, "zh", vars) : st(id, "zh");
  return (
    <>
      <span className={`t-en${cls}`}>{en}</span>
      <span className={`t-zh${cls}`}>{zh}</span>
    </>
  );
}
