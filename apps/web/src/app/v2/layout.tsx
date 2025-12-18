"use client";

import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { useState } from "react";

export default function V2Layout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="noise-overlay">
      <Header onCartClick={() => setCartOpen(true)} />
      <main>{children}</main>
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
