'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../launch/page.module.css";
import local from "./questions.module.css";

type Lang = "en" | "zh";

interface Option {
  id: string;
  en: string;
  zh: string;
}

interface Question {
  id: string;
  q: { en: string; zh: string };
  detail: { en: string; zh: string };
  context: string;
  options: Option[];
}

interface DoneItem {
  q: { en: string; zh: string };
  detail: { en: string; zh: string };
}

const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    back: "← Back to Launch List",
    eyebrow: "Internal · not indexed",
    title: "Menu Open Questions",
    lede: "Everything the site can't mirror from the official menu on its own — answer below, then copy the answers into a session to get them applied.",
    doneHeading: "Already taken care of",
    doneIntro: "Resolved from the official menu and live on the site.",
    ownerHeading: "For the owner",
    ownerIntro:
      "Needs the owner's POS or policy answers. Pick an option per question, then copy.",
    done: "Done",
    owner: "Owner",
    copyAll: "Copy answers",
    copied: "Copied ✓",
    copyOne: "Copy",
    progress: "answered",
    unanswered: "Unanswered",
    noneYet: "No answers picked yet.",
    decisionsHeader: "Menu owner decisions (from /menu-questions):",
    decision: "Decision",
    langLabel: "Language",
  },
  zh: {
    back: "← 返回上线清单",
    eyebrow: "内部资料 · 不收录",
    title: "菜单待确认问题",
    lede: "网站无法自行对照官方菜单解决的问题——请在下方作答，然后复制答案发给我们落实。",
    doneHeading: "已解决",
    doneIntro: "已对照官方菜单解决并上线。",
    ownerHeading: "请店主确认",
    ownerIntro: "需要店主就收银/政策作答。每题选一个选项，然后复制答案。",
    done: "已完成",
    owner: "店主",
    copyAll: "复制答案",
    copied: "已复制 ✓",
    copyOne: "复制",
    progress: "已回答",
    unanswered: "未回答",
    noneYet: "尚未作答。",
    decisionsHeader: "菜单店主决定（来自 /menu-questions）：",
    decision: "决定",
    langLabel: "语言",
  },
};

const DONE: DoneItem[] = [
  {
    q: {
      en: "Backfilled 15 descriptions + 21 prices from the official site.",
      zh: "已从官方网站补上15条菜品描述和21个价格。",
    },
    detail: {
      en: "Hunan Stir-Fry veg, Favorites descriptions, Traditional stir-fry veg, Specialties, plus unambiguous single prices (soups, appetizers, drinks). Sanity sync verified live.",
      zh: "湖南炒菜配菜说明、招牌菜描述、传统炒菜配菜、特色菜，以及明确的单一定价（汤、前菜、饮料）。已同步并确认上线。",
    },
  },
  {
    q: {
      en: "Mirrored full-size copy onto 16 lunch (L) items.",
      zh: "已将正餐描述同步到16道午餐（L）菜品。",
    },
    detail: {
      en: "Direct matches, three alias matches (Orange, Black Bean Sauce, Hot Garlic spacing), plus the shared fried-rice line for Fried Rice (L).",
      zh: "直接对应、三个别名对应（Orange、Black Bean Sauce、Hot Garlic空格差异），午餐炒饭沿用通用炒饭描述。",
    },
  },
  {
    q: {
      en: "Cloned sibling copy onto Vegetable Fried Rice.",
      zh: "蔬菜炒饭已沿用同系列描述。",
    },
    detail: {
      en: "Same shared fried-rice line as its six siblings.",
      zh: "与其他六道炒饭使用同一条通用描述。",
    },
  },
  {
    q: {
      en: "Kept our cleaned copy on the 8 cosmetic diffs.",
      zh: "8处文字微调保留我们的修正版。",
    },
    detail: {
      en: "Prior typo fixes and spacing cleanup stand; source typos not reintroduced.",
      zh: "保留此前的拼写修正和排版清理，不恢复原文笔误。",
    },
  },
];

const QUESTIONS: Question[] = [
  {
    id: "sizes",
    q: {
      en: "Which price should the site show for size variants?",
      zh: "有大小份之分的菜品，网站应显示哪个价格？",
    },
    detail: {
      en: "Source lists both sizes; our items carry no size. POS decision: one price, both, or split items?",
      zh: "原文列出大小份两个价格，我们的菜品不分大小。请决定：显示一个价格、两个都显示，还是拆成两个菜品？",
    },
    context:
      "Hot & Sour Soup (S $3.25 / L $6.00); Egg Drop Soup (S/L); Wonton Soup (S $4.00 / L $7.50); Steamed White & Brown Rice (S $2 / L $3); Plain Fried Rice (S $2 / L $3); Steamed Noodles (S $5.50 / L $9); Plain Lo Mein (S $5.50 / L $10); Steamed Vegetables (S $5.50 / L $10.50)",
    options: [
      { id: "both", en: "Show both prices (S / L)", zh: "同时显示小份/大份价格" },
      { id: "large", en: "Show the large price only", zh: "只显示大份价格" },
      { id: "small", en: "Show the small price only", zh: "只显示小份价格" },
      {
        id: "split",
        en: "Split into separate small & large items",
        zh: "拆分为小份和大份两个菜品",
      },
    ],
  },
  {
    id: "lettuce",
    q: {
      en: "Which price for multi-protein Lettuce Wraps?",
      zh: "生菜包有三种肉类价格，显示哪个？",
    },
    detail: {
      en: "Source: Chicken $9.50 / Vegetarian $9.50 / Shrimp $10.50 on a single row. Same question as sizes — one price or split?",
      zh: "原文同一行列出：鸡肉 $9.50 / 素 $9.50 / 虾 $10.50。与大小份问题相同——显示一个还是拆分？",
    },
    context: "Lettuce Wraps: Chicken $9.50 / Vegetarian $9.50 / Shrimp $10.50",
    options: [
      { id: "all", en: "Show all three prices", zh: "显示三种价格" },
      { id: "low", en: "Show the $9.50 price only", zh: "只显示 $9.50" },
      { id: "split", en: "Split into three items", zh: "拆分为三个菜品" },
    ],
  },
  {
    id: "missing-copy",
    q: {
      en: "Supply copy for dishes with no description anywhere?",
      zh: "没有任何描述的菜品怎么办？",
    },
    detail: {
      en: "Neither their site nor ours describes: Sesame Honey Seared Chicken (L), Basil Seafood Fried Rice, Shrimp with Snow Pea & Asparagus, Zhajiangmien Noodles, Eggplant Stir-Fry, Baby Bok Choy Stir-Fry, Broccoli Stir-Fry (veg), Home Style Tofu, and the non-Traditional catering variants.",
      zh: "官方网站和我们都没有描述的菜品：Sesame Honey Seared Chicken (L)、Basil Seafood Fried Rice、Shrimp with Snow Pea & Asparagus、Zhajiangmien Noodles、Eggplant Stir-Fry、Baby Bok Choy Stir-Fry、Broccoli Stir-Fry（素）、Home Style Tofu，以及非传统类的 catering 菜品。",
    },
    context:
      "Sesame Honey Seared Chicken (L); Basil Seafood Fried Rice; Shrimp with Snow Pea & Asparagus; Zhajiangmien Noodles; Eggplant Stir-Fry; Baby Bok Choy Stir-Fry; Broccoli Stir-Fry (veg); Home Style Tofu; non-Traditional catering variants",
    options: [
      {
        id: "owner-writes",
        en: "Owner will provide descriptions",
        zh: "店主提供菜品描述",
      },
      { id: "blank", en: "Leave them blank", zh: "留空" },
      {
        id: "draft",
        en: "Have us draft descriptions for owner approval",
        zh: "由我们起草，店主审核",
      },
    ],
  },
  {
    id: "subs",
    q: {
      en: 'Does "NO SUBSTITUTIONS" cover vegetable swaps?',
      zh: "“不可更换”是否包括换蔬菜？",
    },
    detail: {
      en: "Traditional section header says comes with rice, no substitutions. Does that block swapping vegetables (e.g. mushrooms/peppers), or only the protein? Affects what the site should promise.",
      zh: "传统类栏目注明配米饭、不可更换。这是否包括换蔬菜（例如蘑菇/辣椒），还是仅指肉类？这决定网站上如何说明。",
    },
    context: 'Traditional section header: "COMES WITH A SIDE OF RICE, NO SUBSTITUTIONS."',
    options: [
      { id: "strict", en: "No substitutions at all", zh: "一律不可更换" },
      {
        id: "veg-ok",
        en: "Vegetable swaps OK, protein fixed",
        zh: "可换蔬菜，肉类固定",
      },
      {
        id: "flexible",
        en: "Flexible — remove the notice",
        zh: "灵活更换——删除该说明",
      },
    ],
  },
];

const LANG_KEY = "menu-questions-lang";
const ANSWERS_KEY = "menu-questions-answers";

function buildCopy(
  lang: Lang,
  answers: Record<string, string>,
  onlyId?: string
): string {
  const t = STRINGS[lang];
  const lines = [t.decisionsHeader, ""];
  const list = onlyId
    ? QUESTIONS.filter((q) => q.id === onlyId)
    : QUESTIONS;
  const unanswered: string[] = [];
  for (const q of list) {
    const optId = answers[q.id];
    const opt = q.options.find((o) => o.id === optId);
    if (!opt) {
      unanswered.push(q.id);
      continue;
    }
    lines.push(`[${q.id}] ${q.q[lang]}`);
    lines.push(`${t.decision}: ${opt[lang]}`);
    lines.push(`Context: ${q.context}`);
    lines.push(q.detail[lang]);
    lines.push("");
  }
  if (!onlyId) {
    lines.push(
      unanswered.length > 0
        ? `${t.unanswered}: ${unanswered.join(", ")}.`
        : `${t.progress}: ${QUESTIONS.length}/${QUESTIONS.length}.`
    );
  }
  return lines.join("\n");
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function MenuQuestionsClient() {
  const [lang, setLang] = useState<Lang>("en");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedOne, setCopiedOne] = useState<string | null>(null);

  useEffect(() => {
    try {
      const l = localStorage.getItem(LANG_KEY);
      if (l === "en" || l === "zh") setLang(l);
      const a = localStorage.getItem(ANSWERS_KEY);
      if (a) setAnswers(JSON.parse(a));
    } catch {
      // Private mode: session-only state.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {}
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(answers)]);

  const t = STRINGS[lang];
  const answeredCount = QUESTIONS.filter((q) => answers[q.id]).length;

  async function copyAll() {
    const ok = await copyText(buildCopy(lang, answers));
    if (ok) {
      setCopiedAll(true);
      window.setTimeout(() => setCopiedAll(false), 2000);
    }
  }

  async function copyOne(id: string) {
    const ok = await copyText(buildCopy(lang, answers, id));
    if (ok) {
      setCopiedOne(id);
      window.setTimeout(() => setCopiedOne(null), 2000);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/launch" className={styles.backLink}>
          {t.back}
        </Link>
        <div className={local.topRow}>
          <p className={styles.eyebrow}>{t.eyebrow}</p>
          <div
            className={local.langSwitch}
            role="group"
            aria-label={t.langLabel}
          >
            {(["en", "zh"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`${local.langBtn} ${
                  lang === l ? local.langBtnActive : ""
                }`}
              >
                {l === "en" ? "EN" : "中文"}
              </button>
            ))}
          </div>
        </div>
        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.lede}>{t.lede}</p>

        <section className={styles.group}>
          <h2 className={styles.groupTitle}>{t.doneHeading}</h2>
          <p className={styles.groupIntro}>{t.doneIntro}</p>
          <ul className={styles.list}>
            {DONE.map((item) => (
              <li key={item.q.en} className={styles.item}>
                <span className={`${styles.pill} ${styles.live}`}>
                  {t.done}
                </span>
                <div>
                  <p className={styles.itemText}>{item.q[lang]}</p>
                  <p className={styles.itemNote}>{item.detail[lang]}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.group}>
          <h2 className={styles.groupTitle}>{t.ownerHeading}</h2>
          <p className={styles.groupIntro}>{t.ownerIntro}</p>
          <div className={local.toolbar}>
            <button
              type="button"
              onClick={copyAll}
              disabled={answeredCount === 0}
              className={local.copyBtn}
            >
              {copiedAll ? t.copied : t.copyAll}
              {answeredCount > 0 &&
                ` (${answeredCount}/${QUESTIONS.length})`}
            </button>
            {answeredCount === 0 && (
              <span className={local.progressNote}>{t.noneYet}</span>
            )}
          </div>
          <ul className={styles.list}>
            {QUESTIONS.map((q, qi) => (
              <li key={q.id} className={styles.item}>
                <span className={`${styles.pill} ${styles.owner}`}>
                  {t.owner}
                </span>
                <div className={local.qBody}>
                  <p className={styles.itemText}>
                    {qi + 1}. {q.q[lang]}
                  </p>
                  <p className={styles.itemNote}>{q.detail[lang]}</p>
                  <div
                    className={local.options}
                    role="radiogroup"
                    aria-label={q.q[lang]}
                  >
                    {q.options.map((opt) => (
                      <label key={opt.id} className={local.option}>
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[q.id] === opt.id}
                          onChange={() =>
                            setAnswers((a) => ({ ...a, [q.id]: opt.id }))
                          }
                        />
                        <span>{opt[lang]}</span>
                      </label>
                    ))}
                  </div>
                  {answers[q.id] && (
                    <button
                      type="button"
                      onClick={() => copyOne(q.id)}
                      className={local.copyOne}
                    >
                      {copiedOne === q.id ? t.copied : t.copyOne}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
