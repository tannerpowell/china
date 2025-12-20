import data from "@/data/menu.normalized.json";
export default function MenuPreview() {
  const items = (data as any).items?.slice(0, 8) ?? [];
  if (!items.length) {
    return <div style={{ padding: 16, background: "white", border: "1px solid rgba(23,23,23,0.14)", borderRadius: 12 }}>Run scraper + normalize to populate menu JSON.</div>;
  }
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {items.map((it: any) => (
        <div key={it.id} style={row}>
          <div style={{ fontWeight: 700 }}>{it.name}</div>
          <div style={{ color: "var(--muted)" }}>${Number(it.basePrice ?? 0).toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 14px", background: "white", border: "1px solid rgba(23,23,23,0.14)", borderRadius: 12 };
