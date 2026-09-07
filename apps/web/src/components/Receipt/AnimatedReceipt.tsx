"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./AnimatedReceipt.module.css";

// ============================================================================
// AnimatedReceipt — thermal receipt that "prints" (feeds out of a slot).
// Generic chrome: the receipt BODY is `children`, so any surface (checkout
// confirmation today, /Catch tomorrow) can reuse the machine + animation
// without forking it. Receipt content builders live with their callers.
//
// Technique (borrowed from kalki-kgp/receipt-printer, reimplemented with
// zero deps): the paper starts translated above an overflow-hidden mask and
// feeds down to 0. Stepped motion holds and advances in alternating
// keyframe pairs, like a real dot-matrix feed. Torn edge is a generated
// clip-path polygon — no image assets needed.
// ============================================================================

export type ReceiptStage = "processing" | "printing" | "complete";
export type ReceiptFeedMotion = "stepped" | "smooth";

interface AnimatedReceiptProps {
  stage: ReceiptStage;
  /** "stepped" feeds line-by-line; "smooth" eases out in one motion. */
  feedMotion?: ReceiptFeedMotion;
  /** false = no animation, paper simply appears (also honored via
      prefers-reduced-motion in CSS). */
  animate?: boolean;
  /** Small title strip on the machine, e.g. order number. */
  machineTitle?: ReactNode;
  /** Status line override per stage; defaults are sensible. */
  statusText?: Partial<Record<ReceiptStage, string>>;
  /** The receipt itself — any markup, usually monospace lines. */
  children: ReactNode;
  className?: string;
  /** Pass-through for CSS vars, e.g. shadow tuning
      ({ "--rcpt-blur": "48px" } as CSSProperties). */
  style?: CSSProperties;
}

const DEFAULT_STATUS: Record<ReceiptStage, string> = {
  processing: "Processing…",
  printing: "Printing receipt…",
  complete: "Done — enjoy!",
};

// Torn zig-zag bottom edge, generated so no asset file is needed.
function tornEdgeClip(teeth = 40, depthPx = 5): string {
  const pts: string[] = [];
  for (let i = 0; i <= teeth * 2; i++) {
    const x = 100 - (i * 100) / (teeth * 2);
    const y = i % 2 === 0 ? "100%" : `calc(100% - ${depthPx}px)`;
    pts.push(`${x}% ${y}`);
  }
  return `polygon(0 0, 100% 0, 100% calc(100% - ${depthPx}px), ${pts.join(", ")})`;
}

export function AnimatedReceipt({
  stage,
  feedMotion = "stepped",
  animate = true,
  machineTitle,
  statusText,
  children,
  className,
  style,
}: AnimatedReceiptProps) {
  const cls = [styles.root, className ?? ""].filter(Boolean).join(" ");
  const motionCls = feedMotion === "stepped" ? styles.stepped : styles.smooth;
  const visible = stage !== "processing";

  // Measure the paper so the output mask always fits it: fixed heights
  // clip long receipts at the bottom. +SHADOW_ROOM leaves space for the
  // drop shadow to fade below the torn edge instead of slicing.
  const SHADOW_ROOM = 64;
  const paperRef = useRef<HTMLElement>(null);
  const [maskH, setMaskH] = useState<number | null>(null);
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    const measure = () => setMaskH(el.offsetHeight + SHADOW_ROOM);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  return (
    <section
      aria-label="Receipt printer"
      data-stage={stage}
      data-animate={animate}
      style={style}
      className={`${cls} ${motionCls} ${visible ? styles.fed : styles.parked} ${
        animate ? "" : styles.noAnim
      }`}
    >
      <div className={styles.machine}>
        <div className={styles.machineHeader}>{machineTitle}</div>
        <div className={styles.screen}>
          <span aria-hidden="true" className={styles.indicator}>
            {stage === "complete" ? (
              <span className={styles.check}>✓</span>
            ) : (
              <span className={styles.spinner} />
            )}
          </span>
          <div role="status" aria-live="polite" className={styles.statusText}>
            {statusText?.[stage] ?? DEFAULT_STATUS[stage]}
          </div>
        </div>
        <div aria-hidden="true" className={styles.slot} />
      </div>

      <div
        className={styles.output}
        style={maskH ? { height: maskH } : undefined}
      >
        <div
          aria-hidden={stage !== "complete"}
          className={styles.feed}
          data-testid="receipt-paper"
        >
          <article
            ref={paperRef}
            className={styles.paper}
            style={{ clipPath: tornEdgeClip() }}
          >
            {children}
          </article>
        </div>
      </div>
    </section>
  );
}
