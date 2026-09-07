"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { T } from "@/components/T";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteThemeToggle } from "@/components/SiteThemeToggle";
import {
  AnimatedReceipt,
  type ReceiptFeedMotion,
  type ReceiptStage,
} from "@/components/Receipt/AnimatedReceipt";
import navStyles from "../../launch/page.module.css";
import styles from "./demo.module.css";

// Demo sample: dinner for four. Deliberately long — the mask must fit
// the whole receipt with room for the shadow, never clip the bottom.
// The real confirmation will pass the live cart instead.
const SAMPLE = {
  orderNo: "CI-DEMO01",
  items: [
    { name: "Kung Pao Chicken", qty: 2, price: 25.9, mods: ["Hot"] },
    { name: "Sesame Chicken", qty: 1, price: 13.95, mods: [] },
    { name: "Mapo Tofu", qty: 1, price: 12.95, mods: ["Extra spicy"] },
    { name: "Crab Rangoon (6)", qty: 1, price: 7.95, mods: [] },
    { name: "Egg Rolls (4)", qty: 1, price: 6.95, mods: [] },
    { name: "Vegetable Fried Rice", qty: 2, price: 21.9, mods: ["No egg"] },
    { name: "Hot & Sour Soup", qty: 1, price: 5.5, mods: [] },
  ],
  subtotal: 95.1,
  tax: 7.85,
  total: 102.95,
  last4: "4242",
};

const money = (n: number) => `$${n.toFixed(2)}`;

export function ReceiptDemo() {
  const [stage, setStage] = useState<ReceiptStage>("processing");
  const [motion, setMotion] = useState<ReceiptFeedMotion>("stepped");
  const [animate, setAnimate] = useState(true);
  // Shadow tuning sliders — live CSS vars on the receipt root.
  const [blur, setBlur] = useState(10);
  const [dist, setDist] = useState(5);
  const [dark, setDark] = useState(14);
  const timers = useRef<number[]>([]);

  const play = useCallback(
    (m: ReceiptFeedMotion) => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      // Reset to parked first so the feed animation restarts cleanly,
      // then step through the stages like the real checkout will.
      setStage("processing");
      timers.current.push(
        window.setTimeout(() => setStage("printing"), 900),
        window.setTimeout(() => setStage("complete"), m === "stepped" ? 3400 : 4000)
      );
    },
    []
  );

  useEffect(() => {
    play(motion);
    return () => timers.current.forEach(clearTimeout);
  }, [play, motion]);

  return (
    <main className={styles.main}>
      <div className={`${navStyles.ownerBar} ${styles.ownerBar}`}>
        <Link href="/" className={navStyles.homeBrand} aria-label="China Island Asian Grill — home">
          <Image src="/logo.png" alt="" width={32} height={32} />
          <span>China Island</span>
        </Link>
      </div>
      <div className={`${navStyles.ownerBar} ${styles.ownerBar}`}>
        <nav className={navStyles.ownerNav} aria-label="Owner pages">
          <Link href="/launch"><T id="nav.launch" /></Link>
          <Link href="/menu-questions"><T id="nav.questions" /></Link>
          <span className={navStyles.ownerNavActive} aria-current="page">
            <T id="nav.receiptDemo" />
          </span>
        </nav>
        <div className={navStyles.toggles}>
          <SiteThemeToggle />
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.introCol}>
          <h1 className={styles.title}>Receipt demo</h1>
          <p className={styles.lede}>
            Candidate animated receipt for the order confirmation. Same
            sample order every run — replay it, switch the feed, or kill
            the motion.
          </p>

          <div className={styles.controls} role="group" aria-label="Demo controls">
            <button
              type="button"
              className={styles.replay}
              onClick={() => play(motion)}
            >
              Replay
            </button>
            <div className={styles.seg} role="group" aria-label="Feed motion">
              {(["stepped", "smooth"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={motion === m ? styles.active : ""}
                  onClick={() => setMotion(m)}
                  aria-pressed={motion === m}
                >
                  {m}
                </button>
              ))}
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={animate}
                onChange={(e) => setAnimate(e.target.checked)}
              />
              Animate
            </label>
          </div>

          <div className={styles.sliders} role="group" aria-label="Shadow tuning">
            <p className={styles.slidersTitle}>Shadow — tune it live</p>
            {[
              { label: "Softness", value: blur, set: setBlur, min: 4, max: 64, unit: "px" },
              { label: "Drop", value: dist, set: setDist, min: 0, max: 48, unit: "px" },
              { label: "Darkness", value: dark, set: setDark, min: 0, max: 30, unit: "%" },
            ].map((s) => (
              <label key={s.label} className={styles.slider}>
                <span>
                  {s.label} · {s.value}
                  {s.unit}
                </span>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  value={s.value}
                  onChange={(e) => s.set(Number(e.target.value))}
                />
              </label>
            ))}
          </div>
        </div>

        <div className={styles.stage}>
        <AnimatedReceipt
          stage={stage}
          feedMotion={motion}
          animate={animate}
          style={
            {
              "--rcpt-blur": `${blur}px`,
              "--rcpt-y": `${dist}px`,
              "--rcpt-a": dark / 100,
            } as CSSProperties
          }
          machineTitle={`Order #${SAMPLE.orderNo}`}
          statusText={{
            processing: "Sending to kitchen…",
            printing: "Printing your receipt…",
            complete: "Order confirmed",
          }}
        >
          <div className={styles.rcpt}>
            <p className={styles.center}>CHINA ISLAND ASIAN GRILL</p>
            <p className={styles.center}>Flower Mound, TX</p>
            <p className={styles.center}>Order #{SAMPLE.orderNo} · Pickup</p>
            <hr />
            {SAMPLE.items.map((it) => (
              <div key={it.name}>
                <p className={styles.line}>
                  <span>
                    {it.qty}x {it.name}
                  </span>
                  <span>{money(it.price)}</span>
                </p>
                {it.mods.map((mod) => (
                  <p key={mod} className={styles.mod}>
                    + {mod}
                  </p>
                ))}
              </div>
            ))}
            <hr />
            <p className={styles.line}>
              <span>Subtotal</span>
              <span>{money(SAMPLE.subtotal)}</span>
            </p>
            <p className={styles.line}>
              <span>Tax</span>
              <span>{money(SAMPLE.tax)}</span>
            </p>
            <p className={`${styles.line} ${styles.total}`}>
              <span>Total</span>
              <span>{money(SAMPLE.total)}</span>
            </p>
            <hr />
            <p className={styles.center}>Paid card ending {SAMPLE.last4}</p>
            <p className={styles.center}>Demo — no charge</p>
            <p className={styles.center}>Thank you!</p>
          </div>
        </AnimatedReceipt>
        </div>
      </div>
      <div className={styles.footerWrap}>
        <SiteFooter />
      </div>
    </main>
  );
}
