"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

// Demo-only sample order. The real confirmation will pass the live cart;
// /Catch (or anyone else) passes whatever receipt body it wants as children.
const SAMPLE = {
  orderNo: "CI-DEMO01",
  items: [
    { name: "Kung Pao Chicken", qty: 2, price: 25.9, mods: ["Hot"] },
    { name: "Crab Rangoon (6)", qty: 1, price: 7.95, mods: [] },
    { name: "Vegetable Fried Rice", qty: 1, price: 10.95, mods: ["No egg"] },
  ],
  subtotal: 44.8,
  tax: 3.69,
  total: 48.49,
  last4: "4242",
};

const money = (n: number) => `$${n.toFixed(2)}`;

export function ReceiptDemo() {
  const [stage, setStage] = useState<ReceiptStage>("processing");
  const [motion, setMotion] = useState<ReceiptFeedMotion>("stepped");
  const [animate, setAnimate] = useState(true);
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
        <div className={navStyles.toggles}>
          <SiteThemeToggle />
        </div>
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
      <h1 className={styles.title}>Receipt demo</h1>
      <p className={styles.lede}>
        Candidate animated receipt for the order confirmation. Same sample
        order every run — replay it, switch the feed, or kill the motion.
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

      <div className={styles.stage}>
        <AnimatedReceipt
          stage={stage}
          feedMotion={motion}
          animate={animate}
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
      <div className={styles.footerWrap}>
        <SiteFooter />
      </div>
    </main>
  );
}
