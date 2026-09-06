import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Order Online",
  description: "Order online from China Island Asian Grill. Pickup and delivery available.",
  alternates: { canonical: "/order" },
};

// Style constants
const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  padding: "12px 14px",
  background: "var(--cta)",
  color: "white",
  borderRadius: 9999,
  textDecoration: "none",
  fontWeight: 700,
};

const btnSecondary: React.CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  padding: "12px 14px",
  border: "1px solid rgba(23,23,23,0.14)",
  borderRadius: 9999,
  textDecoration: "none",
  fontWeight: 600,
  background: "white",
};

export default function OrderPage() {
  const orderUrl = process.env.NEXT_PUBLIC_ORDER_CART_URL ?? "https://us.chinesemenu.com/order/shoppingcart.htm";
  const phone = process.env.NEXT_PUBLIC_RESTAURANT_PHONE ?? "";
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Order Online" },
        ])}
      />
      <h1 style={{ marginTop: 0 }}>Order</h1>
      <p style={{ color: "var(--muted)" }}>Ordering currently links out while we replace checkout.</p>
      <div style={{ display: "grid", gap: 10 }}>
        <a href={orderUrl} target="_blank" rel="noopener noreferrer" style={btnPrimary}>Order Online</a>
        {phone ? <a href={`tel:${phone}`} style={btnSecondary}>Call for Takeout</a> : null}
      </div>
    </main>
  );
}
