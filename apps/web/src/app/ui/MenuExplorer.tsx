"use client";
import { useMemo, useState } from "react";
import data from "@/data/menu.normalized.json";

interface MenuItem {
  id: string;
  name: string;
  categoryId?: string;
  basePrice?: number;
  tags?: { spicy?: boolean; vegetarian?: boolean; popular?: boolean };
}

interface Category {
  id: string;
  title: string;
}

interface NormalizedMenu {
  categories?: Category[];
  items?: MenuItem[];
}

export default function MenuExplorer() {
  const normalized = data as NormalizedMenu;
  const [q, setQ] = useState("");
  const [onlySpicy, setOnlySpicy] = useState(false);
  const [onlyVeg, setOnlyVeg] = useState(false);
  const [onlyPopular, setOnlyPopular] = useState(false);

  const categories = normalized.categories ?? [];
  const items = normalized.items ?? [];

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return items.filter((it) => {
      if (qq && !(it.name || "").toLowerCase().includes(qq)) return false;
      if (onlySpicy && !it.tags?.spicy) return false;
      if (onlyVeg && !it.tags?.vegetarian) return false;
      if (onlyPopular && !it.tags?.popular) return false;
      return true;
    });
  }, [items, q, onlySpicy, onlyVeg, onlyPopular]);

  const byCat = useMemo(() => {
    const m = new Map<string, MenuItem[]>();
    for (const it of filtered) {
      const key = it.categoryId || "cat_uncategorized";
      const arr = m.get(key) ?? [];
      arr.push(it);
      m.set(key, arr);
    }
    return m;
  }, [filtered]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 28 }}>
      <aside style={{ position: "sticky", top: 24, alignSelf: "start" }}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Menu</h1>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" aria-label="Search menu items" style={input} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          <Chip label="Spicy" active={onlySpicy} onClick={() => setOnlySpicy(v => !v)} />
          <Chip label="Vegetarian" active={onlyVeg} onClick={() => setOnlyVeg(v => !v)} />
          <Chip label="Popular" active={onlyPopular} onClick={() => setOnlyPopular(v => !v)} />
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Jump to</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map((c) => <a key={c.id} href={`#${c.id}`} style={pill}>{c.title}</a>)}
          </div>
        </div>
      </aside>

      <section>
        {!categories.length ? (
          <div style={{ padding: 16, background: "white", border: "1px solid rgba(23,23,23,0.14)", borderRadius: 12 }}>
            No categories found yet. Run scraper + normalize.
          </div>
        ) : null}

        {categories.map((c) => {
          const group = byCat.get(c.id) ?? [];
          if (!group.length) return null;
          return (
            <div key={c.id} id={c.id} style={{ marginBottom: 24 }}>
              <h2 style={{ marginBottom: 8 }}>{c.title}</h2>
              <div style={{ borderTop: "2px dotted var(--ornament)", marginBottom: 10 }} />
              <div style={{ display: "grid", gap: 10 }}>
                {group.map((it) => (
                  <div key={it.id} style={row}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{it.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {it.tags?.spicy ? "🌶 " : ""}{it.tags?.vegetarian ? "🌱 " : ""}{it.tags?.popular ? "★ " : ""}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700 }}>${Number(it.basePrice ?? 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function Chip(props: { label: string; active: boolean; onClick: () => void }) {
  return <button onClick={props.onClick} style={{ ...chip, ...(props.active ? chipActive : {}) }}>{props.label}</button>;
}

const input: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(23,23,23,0.14)", background: "white" };
const chip: React.CSSProperties = { padding: "8px 10px", borderRadius: 9999, border: "1px solid rgba(23,23,23,0.14)", background: "white", cursor: "pointer", fontSize: 13 };
const chipActive: React.CSSProperties = { borderColor: "var(--ornament)" };
const pill: React.CSSProperties = { display: "inline-flex", padding: "8px 12px", border: "1px solid rgba(23,23,23,0.14)", borderRadius: 9999, textDecoration: "none", background: "white", fontSize: 13 };
const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 14px", background: "white", border: "1px solid rgba(23,23,23,0.14)", borderRadius: 12 };
