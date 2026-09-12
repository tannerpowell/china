'use client';

import { useCallback, useEffect, useState } from "react";
import { SITE_LANG_KEY, type SiteLang } from "@/lib/i18n";
import { st } from "@/lib/i18n";

function readLang(): SiteLang {
  try {
    return localStorage.getItem(SITE_LANG_KEY) === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

function currentLang(): SiteLang {
  return document.documentElement.dataset.lang === "zh" ? "zh" : "en";
}

function swapAttrs(root: ParentNode = document) {
  const lang = currentLang();
  root
    .querySelectorAll<HTMLElement>("[data-ph-en]")
    .forEach((el) => {
      const v =
        lang === "zh"
          ? el.dataset.phZh
          : el.dataset.phEn;
      if (v !== undefined && "placeholder" in el) {
        (el as HTMLInputElement).placeholder = v;
      }
    });
  root
    .querySelectorAll<HTMLElement>("[data-aria-en]")
    .forEach((el) => {
      const v = lang === "zh" ? el.dataset.ariaZh : el.dataset.ariaEn;
      if (v !== undefined) el.setAttribute("aria-label", v);
    });
}

function applyLang(lang: SiteLang) {
  document.documentElement.dataset.lang = lang;
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  swapAttrs();
}

// Late-mounted islands (modals, dialogs) miss the toggle-time swap, so
// watch for new nodes carrying dual-language attributes.
let observing = false;
function observeAttrs() {
  if (observing || typeof MutationObserver === "undefined") return;
  observing = true;
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      swapAttrs();
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
}

/**
 * Site language toggle island (EN / 中文). Persists to localStorage, syncs
 * across islands on the page via storage events, and applies pre-paint on
 * load through the layout script. Server-rendered copy stays in place —
 * only CSS visibility + attributes change.
 */
export function useSiteLang() {
  const [lang, setLangState] = useState<SiteLang>("en");

  useEffect(() => {
    const stored = readLang();
    setLangState(stored);
    applyLang(stored);
    observeAttrs();
    const onStorage = (e: StorageEvent) => {
      if (e.key === SITE_LANG_KEY) setLangState(readLang());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLang = useCallback((next: SiteLang) => {
    setLangState(next);
    try {
      localStorage.setItem(SITE_LANG_KEY, next);
    } catch {
      // Private mode: applies this session only.
    }
    applyLang(next);
  }, []);

  return { lang, setLang };
}

export function LanguageToggle({ compact }: { compact?: boolean }) {
  const { lang, setLang } = useSiteLang();
  return (
    <div
      className={`site-lang${compact ? " site-lang-compact" : ""}`}
      role="group"
      aria-label={lang === "zh" ? st("nav.lang", "zh") : st("nav.lang", "en")}
    >
      {(["en", "zh"] as SiteLang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`site-lang-btn ${lang === l ? "is-active" : ""}`}
        >
          {l === "en" ? "EN" : "中文"}
        </button>
      ))}
    </div>
  );
}
