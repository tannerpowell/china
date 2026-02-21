"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Lightweight navigation progress bar.
 * Shows after 150ms delay to avoid flash on fast navigations.
 * Uses the same approach as NProgress but zero-dependency.
 */
export function NavigationProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const start = useCallback(() => {
    // Delay showing the bar by 150ms (fast navigations won't show it)
    timerRef.current = setTimeout(() => {
      setProgress(10);
      setVisible(true);
      // Trickle progress
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) return p;
          return p + (90 - p) * 0.1;
        });
      }, 200);
    }, 150);
  }, []);

  const done = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  }, []);

  useEffect(() => {
    // Intercept link clicks to detect navigation start
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || anchor.target === "_blank") return;
      start();
    };

    // Detect navigation end via popstate and Next.js route changes
    const handleComplete = () => done();

    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handleComplete);

    // MutationObserver to detect when Next.js swaps content (navigation complete)
    const observer = new MutationObserver(() => {
      if (visible) done();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handleComplete);
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [start, done, visible]);

  if (!visible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: 2,
        background: "var(--color-red)",
        zIndex: 9999,
        transition: progress === 100 ? "width 200ms ease, opacity 300ms ease" : "width 400ms ease",
        opacity: progress === 100 ? 0 : 1,
      }}
    />
  );
}
